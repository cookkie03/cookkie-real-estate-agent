/**
 * CRM IMMOBILIARE - Geocoding Batch Script
 *
 * Geocodes all buildings without coordinates using Nominatim OSM API.
 * Respects rate limit (1 request/second) and handles errors gracefully.
 *
 * Usage:
 *   npx tsx scripts/geocode-batch.ts
 *
 * Features:
 * - Progress bar with ETA
 * - Retry logic (3 attempts per address)
 * - Rate limiting (1.1s delay between requests)
 * - Error logging to file
 * - Resume capability (skips already geocoded)
 *
 * @module scripts/geocode-batch
 * @since v3.2.0
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Nominatim API configuration
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'CRM-Immobiliare/3.2.0 (Real Estate Management System)';
const RATE_LIMIT_DELAY = 1100; // 1.1 seconds (conservative)
const MAX_RETRIES = 3;

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface GeocodingError {
  buildingId: string;
  address: string;
  error: string;
  timestamp: string;
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Geocode an address using Nominatim OSM API
 */
async function geocodeAddress(
  address: string,
  city: string,
  province: string,
  zip?: string | null
): Promise<{ lat: number; lng: number } | null> {
  const fullAddress = `${address}, ${city}, ${province}${zip ? `, ${zip}` : ''}, Italia`;

  const params = new URLSearchParams({
    q: fullAddress,
    format: 'json',
    limit: '1',
    countrycodes: 'it', // Restrict to Italy
    addressdetails: '1'
  });

  const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const results: GeocodingResult[] = await response.json();

    if (results.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon)
    };
  } catch (error) {
    throw new Error(`Geocoding failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Geocode a building with retry logic
 */
async function geocodeBuildingWithRetry(
  building: any,
  attempt: number = 1
): Promise<{ lat: number; lng: number } | null> {
  try {
    const result = await geocodeAddress(
      `${building.street} ${building.civic}`,
      building.city,
      building.province,
      building.zip
    );

    if (!result && attempt < MAX_RETRIES) {
      console.log(`  ⚠️  No results, retrying (${attempt}/${MAX_RETRIES})...`);
      await sleep(RATE_LIMIT_DELAY);
      return geocodeBuildingWithRetry(building, attempt + 1);
    }

    return result;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      console.log(`  ⚠️  Error, retrying (${attempt}/${MAX_RETRIES})...`);
      await sleep(RATE_LIMIT_DELAY);
      return geocodeBuildingWithRetry(building, attempt + 1);
    }

    throw error;
  }
}

/**
 * Log geocoding errors to file
 */
function logError(error: GeocodingError): void {
  const logDir = path.join(__dirname, '../logs');
  const logFile = path.join(logDir, 'geocoding-errors.json');

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Read existing errors or create new array
  let errors: GeocodingError[] = [];
  if (fs.existsSync(logFile)) {
    const content = fs.readFileSync(logFile, 'utf-8');
    errors = JSON.parse(content);
  }

  // Append new error
  errors.push(error);

  // Write back to file
  fs.writeFileSync(logFile, JSON.stringify(errors, null, 2));
}

/**
 * Format progress bar
 */
function formatProgress(current: number, total: number, startTime: number): string {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((barLength * current) / total);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  // Calculate ETA
  const elapsed = Date.now() - startTime;
  const rate = current / (elapsed / 1000); // items per second
  const remaining = total - current;
  const eta = remaining / rate;
  const etaMinutes = Math.floor(eta / 60);
  const etaSeconds = Math.floor(eta % 60);

  return `[${bar}] ${percentage}% (${current}/${total}) - ETA: ${etaMinutes}m ${etaSeconds}s`;
}

/**
 * Main geocoding batch process
 */
async function main() {
  console.log('🗺️  CRM Immobiliare - Geocoding Batch Script\n');

  try {
    // Fetch buildings without coordinates
    console.log('📊 Fetching buildings without coordinates...');
    const buildings = await prisma.building.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        code: true,
        street: true,
        civic: true,
        city: true,
        province: true,
        zip: true
      }
    });

    console.log(`✅ Found ${buildings.length} buildings to geocode\n`);

    if (buildings.length === 0) {
      console.log('✨ All buildings already have coordinates!');
      return;
    }

    // Confirm before proceeding
    console.log(`⚠️  This will make ${buildings.length} API requests to Nominatim.`);
    console.log(`⏱️  Estimated time: ~${Math.ceil(buildings.length * 1.1 / 60)} minutes\n`);

    // Process each building
    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < buildings.length; i++) {
      const building = buildings[i];
      const address = `${building.street} ${building.civic}, ${building.city}`;

      process.stdout.write(`\r${formatProgress(i, buildings.length, startTime)}`);
      console.log(`\n📍 [${i + 1}/${buildings.length}] ${building.code}: ${address}`);

      try {
        // Geocode with retry
        const coords = await geocodeBuildingWithRetry(building);

        if (coords) {
          // Update database
          await prisma.building.update({
            where: { id: building.id },
            data: {
              latitude: coords.lat,
              longitude: coords.lng
            }
          });

          console.log(`   ✅ Success: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
          successCount++;
        } else {
          console.log(`   ❌ No results found`);
          errorCount++;

          logError({
            buildingId: building.id,
            address: address,
            error: 'No geocoding results found',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        errorCount++;

        logError({
          buildingId: building.id,
          address: address,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }

      // Rate limiting (except for last item)
      if (i < buildings.length - 1) {
        await sleep(RATE_LIMIT_DELAY);
      }
    }

    // Final progress bar
    process.stdout.write(`\r${formatProgress(buildings.length, buildings.length, startTime)}\n\n`);

    // Summary
    console.log('━'.repeat(60));
    console.log('📊 GEOCODING SUMMARY');
    console.log('━'.repeat(60));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors:  ${errorCount}`);
    console.log(`📊 Total:   ${buildings.length}`);
    console.log(`⏱️  Time:    ${Math.round((Date.now() - startTime) / 1000)}s`);

    if (errorCount > 0) {
      console.log(`\n⚠️  Errors logged to: logs/geocoding-errors.json`);
    }

    console.log('\n✨ Geocoding completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run script
main();
