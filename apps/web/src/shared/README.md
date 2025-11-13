# Shared Components & Utilities

This directory contains components and utilities shared across multiple features.

## Structure

- **components/ui/** - Base UI components (shadcn/ui)
- **components/layout/** - Layout components (Header, Sidebar, etc.)
- **components/common/** - Common components (LoadingSpinner, ErrorBoundary, etc.)
- **hooks/** - Shared custom hooks
- **utils/** - Shared utility functions
- **types/** - Common type definitions

## Rules

- Only include components/utilities used by 3+ features
- Keep feature-specific code in feature directories
- Maintain clear separation of concerns
