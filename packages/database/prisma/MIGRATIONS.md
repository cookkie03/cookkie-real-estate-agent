# 📋 PRISMA MIGRATIONS GUIDE

**Progetto**: CRM Immobiliare
**Database**: SQLite (development) / PostgreSQL (production)
**ORM**: Prisma
**Migration System**: Prisma Migrate

---

## 🎯 OBIETTIVI

Il sistema di migrations Prisma permette di:
- ✅ **Versionare** le modifiche allo schema database
- ✅ **Tracciare** la history completa delle modifiche
- ✅ **Rollback** a versioni precedenti in caso di problemi
- ✅ **Sincronizzare** team su schema changes
- ✅ **Deploy sicuro** in production con migrations testate

---

## 📂 STRUTTURA MIGRATIONS

```
database/prisma/
├── schema.prisma              # Schema Prisma (source of truth)
├── dev.db                     # Database SQLite (development)
└── migrations/                # Directory migrations
    ├── migration_lock.toml    # Lock file (provider: sqlite)
    └── 20251110180622_initial_baseline/
        └── migration.sql      # SQL generato da Prisma
```

### Migration Lock File

```toml
# migration_lock.toml
provider = "sqlite"
```

Questo file blocca il provider del database. Se cambi provider (es. da SQLite a PostgreSQL),
Prisma ti avviserà e dovrai gestire la migrazione dei dati.

---

## 🔄 WORKFLOW DEVELOPMENT

### 1. Modificare lo Schema

Modifica `schema.prisma` per aggiungere/modificare modelli:

```prisma
// Esempio: Aggiungere un campo
model Property {
  // ... campi esistenti
  virtualTour String?  // 🆕 NUOVO CAMPO
}
```

### 2. Creare la Migration

```bash
cd database/prisma

# Crea e applica migration
npx prisma migrate dev --name add_virtual_tour_to_property
```

**Cosa succede**:
1. Prisma confronta `schema.prisma` con database attuale
2. Genera SQL per le modifiche in `migrations/YYYYMMDD_HHMMSS_add_virtual_tour/migration.sql`
3. Applica la migration al database
4. Rigenera Prisma Client
5. Opzionalmente esegue seed script

**Output**:
```
✔ Applying migration `20251110123456_add_virtual_tour_to_property`
✔ Generated Prisma Client
```

### 3. Verificare la Migration

```bash
# Controlla quali migrations sono applicate
npx prisma migrate status

# Apri Prisma Studio per vedere i dati
npx prisma studio
```

### 4. Testare le Modifiche

```typescript
// Verifica che il nuovo campo sia accessibile
const property = await prisma.property.create({
  data: {
    title: "Test",
    virtualTour: "https://tour.example.com"  // ✅ Nuovo campo
  }
});
```

---

## 🚢 WORKFLOW PRODUCTION

### Pre-Deployment Checklist

- [ ] Tutte le migrations testate in development
- [ ] Backup database production completo
- [ ] Migrations testate su copia staging
- [ ] Team notificato del deployment
- [ ] Rollback plan pronto

### Deploy Migrations

```bash
# 1. Backup database
./scripts/backup-database.sh

# 2. Deploy migrations (NON usa migrate dev!)
npx prisma migrate deploy

# 3. Verifica status
npx prisma migrate status

# 4. Test applicazione
curl http://api.example.com/health
```

**⚠️ IMPORTANTE**:
- `migrate dev` è solo per development (può resettare il database)
- `migrate deploy` è per production (applica solo migrations pendenti)

---

## 🔙 ROLLBACK STRATEGIES

### Rollback Automatico (Consigliato)

Se una migration fallisce durante il deploy:

```bash
# Prisma automaticamente fa rollback della migration corrente
# Il database torna allo stato pre-migration
```

### Rollback Manuale

Se hai già applicato una migration e vuoi fare rollback:

#### Opzione 1: Mark as Rolled Back

```bash
# Mark migration as rolled back (non modifica il DB!)
npx prisma migrate resolve --rolled-back 20251110123456_add_virtual_tour

# Poi devi manualmente revertire le modifiche al DB
# Vedi: migrations/20251110123456_add_virtual_tour/migration.sql
# e scrivi l'inverso delle operazioni
```

#### Opzione 2: Restore da Backup

```bash
# Metodo più sicuro per production
./scripts/restore-backup.sh
```

---

## 🛠️ COMANDI UTILI

### Status e Info

```bash
# Vedi quali migrations sono applicate
npx prisma migrate status

# Vedi differenze tra schema e database
npx prisma migrate diff

# Valida schema.prisma
npx prisma validate
```

### Gestione Migrations

```bash
# Crea migration senza applicarla
npx prisma migrate dev --create-only --name my_migration

# Applica migrations pendenti
npx prisma migrate deploy

# Risolvi migration fallita
npx prisma migrate resolve --applied 20251110123456_migration_name
npx prisma migrate resolve --rolled-back 20251110123456_migration_name
```

### Reset (⚠️ SOLO DEVELOPMENT)

```bash
# Reset database completo (CANCELLA TUTTI I DATI!)
npx prisma migrate reset

# Reset + seed
npx prisma migrate reset --skip-seed=false
```

---

## 📝 NAMING CONVENTIONS

### Migration Names

Usa nomi descrittivi che indicano cosa fa la migration:

✅ **GOOD**:
```bash
npx prisma migrate dev --name add_virtual_tour_to_property
npx prisma migrate dev --name create_property_photos_table
npx prisma migrate dev --name add_urgency_score_index
npx prisma migrate dev --name rename_owner_to_seller
```

❌ **BAD**:
```bash
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name temp
npx prisma migrate dev --name test123
```

### Prefissi Consigliati

- `add_` - Aggiungere campo/indice
- `create_` - Creare tabella
- `rename_` - Rinominare campo/tabella
- `remove_` - Rimuovere campo/tabella
- `update_` - Modificare tipo/constraint
- `fix_` - Fix schema issue

---

## 🐛 TROUBLESHOOTING

### Migration Fallita

**Problema**: Migration applica solo parzialmente e poi fallisce

**Soluzione**:
```bash
# 1. Check status
npx prisma migrate status

# 2. Mark as applied se modifiche manuali OK
npx prisma migrate resolve --applied 20251110123456_migration

# 3. Oppure rollback
npx prisma migrate resolve --rolled-back 20251110123456_migration
```

### Drift Detected

**Problema**: `Drift detected: Schema differs from database`

**Causa**: Qualcuno ha modificato il database manualmente

**Soluzione**:
```bash
# Opzione 1: Resettare a schema.prisma (PERDITA DATI!)
npx prisma db push --force-reset

# Opzione 2: Creare migration che rispecchia modifiche manuali
npx prisma migrate dev --name fix_manual_changes
```

### Migration Bloccata

**Problema**: `Migration XXX is currently locked`

**Causa**: Migration precedente non completata

**Soluzione**:
```bash
# Sblocca migration
npx prisma migrate resolve --applied 20251110123456_migration
# o
npx prisma migrate resolve --rolled-back 20251110123456_migration
```

---

## 📊 BEST PRACTICES

### ✅ DO

- **Sempre fare backup** prima di migrate in production
- **Testare migrations** in staging environment
- **Nominare migrations** in modo descrittivo
- **Committare migrations** in git insieme allo schema
- **Documentare modifiche** breaking changes in PR
- **Usare transactions** per migrations complesse

### ❌ DON'T

- **Non modificare** migration già applicate
- **Non cancellare** migrations dalla directory
- **Non usare** `migrate dev` in production
- **Non fare** modifiche manuali al database in production
- **Non skipppare** migrations (applicale tutte in ordine)

---

## 🔐 MIGRATIONS SICURE

### Data Migrations

Se una migration modifica dati esistenti:

```sql
-- 1. Aggiungi colonna nullable
ALTER TABLE properties ADD COLUMN "status" TEXT;

-- 2. Popola con valore default
UPDATE properties SET "status" = 'available' WHERE "status" IS NULL;

-- 3. Rendi NOT NULL (in migration successiva)
-- ALTER TABLE properties ALTER COLUMN "status" SET NOT NULL;
```

### Backwards Compatible

Quando possibile, rendi le migrations backwards compatible:

```prisma
// ✅ GOOD: Prima aggiungere come opzionale
model Property {
  newField String?  // nullable
}

// Poi in migration successiva rendere required
model Property {
  newField String  // required
}
```

### Breaking Changes

Se migration è breaking (richiede code changes):

1. Documenta in PR il breaking change
2. Notifica il team in anticipo
3. Coordina deployment code + migration
4. Considera blue-green deployment

---

## 📚 RESOURCES

### Prisma Documentation
- [Prisma Migrate Overview](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/database/troubleshooting-orm)

### Internal Docs
- `DATABASE_REFACTORING_PLAN.md` - Piano completo refactoring
- `BACKUPS.md` - Strategia backup e recovery (TODO)

---

## 📞 SUPPORT

Se hai problemi con le migrations:

1. Check questo documento
2. Check `npx prisma migrate status`
3. Check logs in `database/prisma/migrations/`
4. Chiedi al team su Slack #database-migrations

---

**Document Version**: 1.0
**Last Updated**: 2025-11-10
**Author**: Database Refactoring Team
**Status**: ✅ In Production Use
