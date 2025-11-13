# ADR 001: Monorepo Structure

## Status
Accepted

## Context
We need to organize a complex real estate CRM with multiple packages, applications, and shared code. The system includes:
- Frontend application
- Backend API (future)
- Shared packages (database, types, utils)
- Infrastructure configuration
- Documentation

## Decision
Adopt a **monorepo structure** with clear separation of concerns:

```
crm-immobiliare/
├── packages/          # Shared libraries
│   ├── database/      # Prisma schema & client
│   ├── shared-types/  # Common types & DTOs
│   ├── config/        # Shared configs
│   └── utils/         # Shared utilities
├── apps/              # Deployable applications
│   ├── web/           # Frontend (Next.js)
│   └── api/           # Backend (NestJS) - future
├── docs/              # Documentation
├── infrastructure/    # Docker & deployment
└── scripts/           # Build & deployment scripts
```

## Consequences

### Positive
- **Code Reuse**: Shared packages eliminate duplication
- **Type Safety**: Shared types ensure consistency
- **Easier Refactoring**: Changes propagate across packages
- **Single Source of Truth**: Database schema, configs, and types are centralized
- **Atomic Commits**: Related changes across packages in single commit
- **Simplified CI/CD**: Single build pipeline

### Negative
- **Build Complexity**: Need proper tooling (PNPM workspaces)
- **Learning Curve**: Team needs to understand monorepo concepts
- **Longer Build Times**: May need to build multiple packages

### Neutral
- **Workspace Management**: Using PNPM workspaces for package linking
- **Versioning**: Internal packages use workspace protocol
- **Build Tool**: Consider Turborepo for caching and parallel builds

## Implementation
- Use **PNPM workspaces** for package management
- Each package has its own `package.json`
- Use workspace protocol for internal dependencies: `"@crm-immobiliare/database": "workspace:*"`
- Implement **Turborepo** for optimized builds (optional)

## References
- [Monorepo Best Practices](https://monorepo.tools/)
- [PNPM Workspaces](https://pnpm.io/workspaces)
