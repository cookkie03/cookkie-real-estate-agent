"""Test scraper Immobiliare.it"""
import asyncio
import sys
import os
from pathlib import Path

# Change to project root
os.chdir(Path(__file__).parent)

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

print("🔍 Testing Immobiliare.it Scraper...")

async def test_scraper():
    try:
        from scraping.portals.immobiliare_it import ImmobiliareItScraper

        print("✅ Scraper module imported successfully")

        # Test scraper with minimal config
        print("\n🔍 Testing scraper initialization...")
        async with ImmobiliareItScraper(profile_name="test_verification") as scraper:
            print("✅ Scraper initialized successfully")

            # Test a very minimal search (1 page max, Milano)
            print("\n🔍 Testing scraper search (1 page, Milano)...")
            listings = await scraper.scrape_search(
                location="milano",
                contract_type="vendita",
                max_pages=1
            )

            print(f"✅ Search completed: found {len(listings)} listings")

            if len(listings) > 0:
                print(f"\n📋 Sample listing:")
                sample = listings[0]
                print(f"  - Title: {sample.get('title', 'N/A')[:50]}...")
                print(f"  - Price: €{sample.get('price', 0):,.0f}")
                print(f"  - Location: {sample.get('location', 'N/A')}")
                print(f"  - Rooms: {sample.get('rooms', 'N/A')}")
                print(f"  - SQM: {sample.get('sqm', 'N/A')}")

            return True

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        print()
        return False

# Run test
success = asyncio.run(test_scraper())

if success:
    print("\n✅ All scraper tests passed!")
    sys.exit(0)
else:
    print("\n❌ Scraper tests failed")
    sys.exit(1)
