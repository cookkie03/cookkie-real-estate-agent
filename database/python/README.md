# Python Database Access

## Overview

SQLAlchemy models and utilities for Python modules to access the CRM database.

**Mirror of Prisma Schema**: These models are kept in sync with `database/prisma/schema.prisma`.

## Usage

### Import Models

```python
from database.python import Contact, Property, Request, Match, get_db_context

# Use context manager for automatic session handling
with get_db_context() as db:
    contacts = db.query(Contact).filter(Contact.status == "active").all()
    for contact in contacts:
        print(f"{contact.fullName} - {contact.primaryEmail}")
```

### FastAPI Integration

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database.python import get_db, Property

@app.get("/properties")
def list_properties(db: Session = Depends(get_db)):
    properties = db.query(Property).filter(Property.status == "available").all()
    return properties
```

### Query Examples

```python
from database.python import Contact, Property, Match, get_db_context

# Get all active contacts
with get_db_context() as db:
    contacts = db.query(Contact).filter(Contact.status == "active").all()

# Get properties with price range
with get_db_context() as db:
    properties = db.query(Property).filter(
        Property.priceSale.between(100000, 200000)
    ).all()

# Get matches with high score
with get_db_context() as db:
    matches = db.query(Match).filter(Match.scoreTotal >= 80).all()

# Join queries
with get_db_context() as db:
    results = db.query(Property, Contact).join(
        Contact, Property.ownerContactId == Contact.id
    ).filter(Property.city == "Milano").all()
```

### Create/Update/Delete

```python
from database.python import Contact, get_db_context
from datetime import datetime

# Create
with get_db_context() as db:
    new_contact = Contact(
        id="cnt_123",
        code="CNT-2025-0001",
        fullName="Mario Rossi",
        primaryEmail="mario.rossi@example.com",
        status="active"
    )
    db.add(new_contact)
    # Auto-commit on context exit

# Update
with get_db_context() as db:
    contact = db.query(Contact).filter(Contact.code == "CNT-2025-0001").first()
    if contact:
        contact.lastContactDate = datetime.utcnow()
        contact.leadScore = 85
    # Auto-commit on context exit

# Delete
with get_db_context() as db:
    contact = db.query(Contact).filter(Contact.code == "CNT-2025-0001").first()
    if contact:
        db.delete(contact)
    # Auto-commit on context exit
```

## Models Available

- `UserProfile` - User profile and settings
- `Contact` - Unified contacts (clients, owners, leads)
- `Building` - Building census
- `Property` - Properties
- `Request` - Search requests
- `Match` - Property-request matches
- `Activity` - CRM activities timeline

## Database Connection

The database connection points to: `../database/prisma/dev.db`

Set via environment variable:
```bash
export DATABASE_URL="file:../database/prisma/dev.db"
```

## Keeping Models in Sync

**IMPORTANT**: When updating `database/prisma/schema.prisma`, also update these SQLAlchemy models to match.

1. Update Prisma schema
2. Run `npx prisma generate`
3. Update corresponding SQLAlchemy models in `models.py`
4. Test queries in Python

## Testing Connection

```python
from database.python import check_db_connection

if check_db_connection():
    print("✓ Database connection successful")
else:
    print("✗ Database connection failed")
```

## See Also

- [../prisma/schema.prisma](../prisma/schema.prisma) - Source of truth for database schema
- [../README.md](../README.md) - Overall database documentation
