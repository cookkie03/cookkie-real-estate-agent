# ADR 002: Clean Architecture (Onion Architecture)

## Status
Accepted

## Context
We need a scalable, maintainable architecture that:
- Separates business logic from technical concerns
- Makes testing easier
- Allows swapping implementations without affecting business logic
- Ensures the domain model remains pure

## Decision
Adopt **Clean Architecture** (also known as Onion Architecture) with four layers:

### Layer 1: Domain (Core)
- **Location**: `domain/`
- **Contents**: Entities, Value Objects, Domain Services, Algorithms
- **Dependencies**: NONE (pure business logic)
- **Example**: `property.entity.ts`, `matching.algorithm.ts`

### Layer 2: Application
- **Location**: `application/`
- **Contents**: Use Cases, Services, Event Handlers, Workers
- **Dependencies**: Domain only
- **Example**: `create-property.use-case.ts`, `properties.service.ts`

### Layer 3: Presentation
- **Location**: `presentation/`
- **Contents**: Controllers, DTOs, Gateways (WebSocket)
- **Dependencies**: Application + Domain
- **Example**: `properties.controller.ts`, `create-property.dto.ts`

### Layer 4: Infrastructure
- **Location**: `infrastructure/`
- **Contents**: Repositories, Adapters, Database, Cache, Queue
- **Dependencies**: Implements interfaces from Domain
- **Example**: `property.repository.ts`, `storage.adapter.ts`

## Dependency Rule

```
Presentation → Application → Domain
Infrastructure → Domain (implements interfaces)
```

**Critical**: Domain has NO dependencies. It defines interfaces that Infrastructure implements.

## Example: Create Property Flow

```typescript
// 1. Presentation Layer
@Post()
create(@Body() dto: CreatePropertyDto) {
  return this.createPropertyUseCase.execute(dto);
}

// 2. Application Layer
class CreatePropertyUseCase {
  execute(dto: CreatePropertyDto) {
    const property = Property.create(dto); // Domain
    return this.repository.save(property); // Infrastructure
  }
}

// 3. Domain Layer
class Property {
  static create(data: PropertyData): Property {
    // Business validation
    if (data.price < 0) throw new Error('Invalid price');
    return new Property(data);
  }
}

// 4. Infrastructure Layer
class PropertyRepository implements IPropertyRepository {
  save(property: Property) {
    return this.prisma.property.create({ data: property });
  }
}
```

## Consequences

### Positive
- **Testability**: Each layer can be tested in isolation
- **Flexibility**: Easy to swap implementations (e.g., change database)
- **Maintainability**: Clear separation of concerns
- **Business Focus**: Domain logic is pure and explicit
- **Framework Independence**: Domain doesn't know about NestJS, Prisma, etc.

### Negative
- **More Files**: More layers means more files and folders
- **Learning Curve**: Team needs to understand the architecture
- **Initial Overhead**: Takes longer to set up initially

### Neutral
- **Interfaces**: Use TypeScript interfaces for ports (Domain → Infrastructure)
- **DTOs**: Use Zod for validation in Presentation layer
- **Dependency Injection**: Use NestJS DI for wiring layers

## Implementation Guidelines

1. **Never import Infrastructure into Domain**
2. **Domain defines interfaces, Infrastructure implements them**
3. **Use Cases orchestrate Domain entities and Services**
4. **Controllers are thin: validate input, call Use Case, format response**
5. **Keep business logic OUT of Controllers and Repositories**

## References
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Onion Architecture](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/)
