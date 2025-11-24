# Features

This directory contains feature modules organized by business domain.

## Structure

Each feature module follows this structure:

```
feature-name/
├── components/     # Feature-specific components
├── hooks/          # Feature-specific hooks
├── store/          # Feature-specific state (Zustand)
├── api/            # Feature API calls
├── pages/          # Feature pages/routes
└── types/          # Feature-specific types
```

## Available Features

- **auth/** - Authentication & authorization
- **properties/** - Property management
- **clients/** - Client/contact management
- **matching/** - Property-client matching
- **map/** - Interactive map view
- **chat/** - AI assistant chat
- **dashboard/** - Dashboard & overview
- **analytics/** - Reports & analytics
- **tasks/** - Tasks & activities
- **scraping/** - Web scraping management
- **settings/** - Application settings

## Principles

- **Feature-First**: Each feature contains everything it needs
- **Colocated**: Keep related code together
- **Isolated**: Features should not directly depend on each other
- **Shared via Core**: Use core/shared for cross-feature communication
