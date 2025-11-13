# Core Framework

This directory contains the core framework setup for the frontend application.

## Structure

- **router/** - TanStack Router configuration (or Next.js App Router)
- **store/** - Zustand root store setup
- **api/** - TanStack Query setup and API client
- **config/** - Environment variables and configuration

## Purpose

The core layer provides:
- Routing configuration
- Global state management
- API client setup
- Application-wide configuration

All features should import from core, but core should not depend on features.
