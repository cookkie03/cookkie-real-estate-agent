# 📁 Cartella .qodo - Documentazione e Template

Questa cartella contiene tutta la documentazione di contesto, template e guide per lo sviluppo del progetto RealEstate AI.

## 📚 Contenuto

### 📋 Documentazione di Contesto

#### `STRUCTURE.md`
Descrizione completa della struttura del progetto:
- Panoramica pagine
- Sistema di navigazione
- Descrizione funzionalità
- Roadmap sviluppi futuri
- Stack tecnologico

#### `NAVIGATION.md`
Guida alla navigazione dell'applicazione:
- Mappa del sito
- Accesso rapido alle funzioni
- Shortcut tastiera
- Comportamento responsive
- Flussi di lavoro comuni

#### `CHANGELOG.md`
Storico delle modifiche:
- Versioni rilasciate
- Nuove feature
- Bug fix
- Metriche progetto

#### `SUMMARY.md`
Riepilogo rapido delle modifiche recenti e stato del progetto

---

### 🎨 Design System

#### `DESIGN_SYSTEM.md`
**Documento principale del design system** - Contiene:

##### Palette Colori
- Colori primari (light/dark mode)
- Colori semantici (success, warning, error)
- Colori per priorità
- Colori per status clienti
- Colori per status immobili
- Colori per match score
- Gradienti

##### Tipografia
- Font family
- Scale tipografica
- Font weights
- Line heights

##### Spaziature
- Scale di spaziatura
- Padding standard
- Gap standard
- Margin standard

##### Border Radius
- Dimensioni standard
- Utilizzo per tipo di elemento

##### Ombre (Shadows)
- Livelli di ombra
- Shadow glow
- Shadow accent

##### Animazioni
- Keyframes disponibili
- Transizioni
- Hover effects

##### Breakpoints Responsive
- Dimensioni breakpoint
- Pattern responsive comuni

##### Componenti UI
- Button variants
- Card standard
- Badge variants
- Input standard

##### Pattern UI/UX
- Header pattern
- Page layout pattern
- Search bar pattern
- Stats card pattern
- Action bar pattern

##### Icone
- Icone comuni
- Dimensioni standard

##### Layout Grid
- Container
- Grid patterns

##### Checklist Design
- Lista di controllo per nuovi componenti

---

### 🏗️ Template

#### `PAGE_TEMPLATE.tsx`
**Template per pagine secondarie** - Include:

##### Struttura Base
- Header con navigazione
- Search and actions bar
- Stats cards (opzionale)
- Main content grid
- Empty state

##### Sezioni Commentate
Ogni sezione è chiaramente delimitata con commenti:
```tsx
/* ============================================
   NOME SEZIONE
   Descrizione della sezione
   ============================================ */
```

##### Varianti Comuni
Documentate nel file:
1. Lista con tabs
2. Layout a due colonne
3. Lista semplice
4. Con sidebar

##### Animazioni Consigliate
- Fade in sequenziale
- Card hover effects
- Transizioni smooth

##### Responsive Patterns
- Grid responsive
- Flex responsive
- Spacing responsive
- Visibility responsive

---

## 🎯 Come Usare Questi File

### Per Creare una Nuova Pagina

1. **Copia il template**
   ```bash
   cp .qodo/PAGE_TEMPLATE.tsx src/app/[nome-pagina]/page.tsx
   ```

2. **Sostituisci i placeholder**
   - `[NOME_PAGINA]` → Nome della tua pagina
   - `[NOME PAGINA]` → Titolo visualizzato

3. **Consulta il Design System**
   - Apri `.qodo/DESIGN_SYSTEM.md`
   - Usa i colori dalla palette definita
   - Applica le animazioni standard
   - Segui i pattern UI/UX

4. **Verifica la coerenza**
   - Usa la checklist design
   - Testa responsive
   - Verifica dark mode

### Per Modificare Componenti Esistenti

1. **Consulta DESIGN_SYSTEM.md**
   - Verifica colori da usare
   - Controlla spacing standard
   - Usa animazioni definite

2. **Mantieni coerenza**
   - Usa gli stessi pattern
   - Applica le stesse transizioni
   - Rispetta i breakpoint

### Per Aggiungere Nuove Feature

1. **Aggiorna CHANGELOG.md**
   - Documenta le modifiche
   - Aggiungi versione

2. **Aggiorna STRUCTURE.md** (se necessario)
   - Nuove pagine
   - Nuove funzionalità

3. **Aggiorna DESIGN_SYSTEM.md** (se necessario)
   - Nuovi colori
   - Nuove animazioni
   - Nuovi pattern

---

## 📖 Ordine di Lettura Consigliato

### Per Nuovi Sviluppatori

1. **`STRUCTURE.md`** - Capire la struttura generale
2. **`NAVIGATION.md`** - Comprendere la navigazione
3. **`DESIGN_SYSTEM.md`** - Studiare il design system
4. **`PAGE_TEMPLATE.tsx`** - Vedere un esempio pratico

### Per Design/UI

1. **`DESIGN_SYSTEM.md`** - Sistema completo
2. **`STRUCTURE.md`** - Contesto applicazione
3. **`PAGE_TEMPLATE.tsx`** - Implementazione pratica

### Per Quick Reference

1. **`SUMMARY.md`** - Stato attuale progetto
2. **`CHANGELOG.md`** - Ultime modifiche
3. **`DESIGN_SYSTEM.md`** - Riferimento rapido colori/spacing

---

## 🔄 Manutenzione

### Quando Aggiornare

- **STRUCTURE.md**: Quando aggiungi/modifichi pagine o funzionalità
- **NAVIGATION.md**: Quando cambi la navigazione o aggiungi shortcut
- **CHANGELOG.md**: Ad ogni release o modifica significativa
- **SUMMARY.md**: Ad ogni milestone importante
- **DESIGN_SYSTEM.md**: Quando aggiungi colori, animazioni o pattern
- **PAGE_TEMPLATE.tsx**: Quando identifichi nuovi pattern comuni

### Best Practices

1. **Mantieni sincronizzati** i file con il codice reale
2. **Documenta subito** le modifiche, non dopo
3. **Usa esempi concreti** nel design system
4. **Testa i template** prima di documentarli
5. **Chiedi feedback** al team su nuovi pattern

---

## 🤝 Contribuire

### Aggiungere Nuovi Pattern

1. Implementa il pattern nel codice
2. Testalo in diversi contesti
3. Documentalo in `DESIGN_SYSTEM.md`
4. Aggiungi esempio in `PAGE_TEMPLATE.tsx` (se applicabile)
5. Aggiorna `CHANGELOG.md`

### Migliorare la Documentazione

1. Identifica sezioni poco chiare
2. Aggiungi esempi pratici
3. Includi screenshot (se utile)
4. Chiedi review al team

---

## 📞 Supporto

Per domande o chiarimenti sulla documentazione:

1. Consulta prima i file esistenti
2. Cerca pattern simili nel codice
3. Chiedi al team se necessario

---

## 🔗 Link Utili

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

---

**Ultimo aggiornamento**: 2024
**Versione**: 1.0.0
