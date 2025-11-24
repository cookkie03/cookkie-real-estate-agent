# 🧪 Guida Test End-to-End - CRM Immobiliare

Guida completa per testare il software come primo utente tester.

---

## 📋 Prerequisiti Completati

Prima di iniziare, assicurati di aver eseguito:

```powershell
✅ git pull origin claude/senza-canc-011CV66ZcJhcuN69jgLsvi6F
✅ pnpm install
✅ pnpm prisma:generate
✅ pnpm approve-builds
```

---

## 🚀 Setup Iniziale (5 minuti)

### **Step 1: Avvia il Database**

Il progetto usa **SQLite** per sviluppo locale (nessun Docker necessario).

```powershell
# Genera il database se non esiste già
pnpm prisma:push
```

Dovresti vedere:
```
✔ Database schema pushed to database
✔ Generated Prisma Client
```

### **Step 2: (Opzionale) Popola Database con Dati di Test**

```powershell
# Esegui seed per creare dati di esempio
pnpm prisma:seed
```

Questo crea:
- 5-10 clienti di esempio
- 10-15 immobili
- 5 richieste clienti
- Match automatici

### **Step 3: Avvia il Frontend**

```powershell
pnpm dev:web
```

Attendi:
```
✓ Ready in 4s
- Local: http://localhost:3000
```

### **Step 4: Apri il Browser**

Vai su **http://localhost:3000**

---

## 🧪 Test Funzionalità Principali

### **1. Dashboard Home** ✅

**URL**: http://localhost:3000

**Cosa testare**:
- [ ] Dashboard si carica senza errori
- [ ] Vedi statistiche (totale clienti, immobili, richieste)
- [ ] Grafici analytics si visualizzano
- [ ] KPI cards mostrano numeri

**Risultato atteso**:
- 📊 Statistiche in tempo reale
- 📈 Grafici (vendite, richieste, lead)
- 🎯 KPI dashboard

**Se vedi errori**:
- Controlla la console browser (F12)
- Verifica che Prisma sia generato
- Riavvia il server

---

### **2. Gestione Clienti** 👥

**URL**: http://localhost:3000/clienti

#### **Test 2.1: Lista Clienti**
- [ ] Vedi tabella/griglia clienti
- [ ] Paginazione funziona
- [ ] Filtri per nome/email/telefono
- [ ] Sorting per colonne

#### **Test 2.2: Crea Nuovo Cliente**
1. Click su **"Nuovo Cliente"** o **"+"**
2. Compila form:
   ```
   Nome: Mario
   Cognome: Rossi
   Email: mario.rossi@example.com
   Telefono: +39 123 456 7890
   Budget: 200000 - 300000€
   Zona: Milano Centro
   Tipo immobile: Appartamento
   ```
3. Click **"Salva"**

**Risultato atteso**:
- ✅ Cliente creato
- 🔔 Notifica successo
- 📋 Cliente appare in lista

#### **Test 2.3: Visualizza Dettaglio Cliente**
1. Click su un cliente nella lista
2. Vai a dettaglio (URL: `/clienti/[id]`)

**Cosa verificare**:
- [ ] Informazioni complete cliente
- [ ] Storico richieste
- [ ] Immobili visualizzati
- [ ] Note e commenti
- [ ] Timeline attività

#### **Test 2.4: Modifica Cliente**
1. Nel dettaglio, click **"Modifica"**
2. Cambia alcuni dati
3. Salva

**Risultato atteso**:
- ✅ Modifiche salvate
- 🔔 Conferma aggiornamento

#### **Test 2.5: Elimina Cliente**
1. Click **"Elimina"** (con conferma)
2. Conferma eliminazione

**Risultato atteso**:
- ❌ Cliente rimosso dalla lista
- 🔔 Notifica eliminazione

---

### **3. Gestione Immobili** 🏠

**URL**: http://localhost:3000/immobili

#### **Test 3.1: Lista Immobili**
- [ ] Griglia immobili con foto
- [ ] Card con prezzo, mq, zona
- [ ] Vista lista/griglia toggle
- [ ] Filtri:
  - [ ] Prezzo min/max
  - [ ] Mq min/max
  - [ ] Zona/Città
  - [ ] Tipo (appartamento, villa, etc.)
  - [ ] Contratto (vendita/affitto)

#### **Test 3.2: Crea Nuovo Immobile**
1. Click **"Nuovo Immobile"**
2. Compila form completo:
   ```
   Titolo: Appartamento Centro Milano
   Tipo: Appartamento
   Contratto: Vendita
   Prezzo: 280000€

   Indirizzo:
   - Via: Via Dante, 15
   - Città: Milano
   - CAP: 20121
   - Zona: Centro Storico

   Caratteristiche:
   - MQ: 85
   - Locali: 3
   - Bagni: 2
   - Piano: 3
   - Ascensore: Sì
   - Box Auto: Sì
   - Balcone: Sì

   Descrizione:
   "Bellissimo trilocale nel cuore di Milano..."

   Foto:
   - Upload 3-5 immagini
   ```
3. Salva

**Risultato atteso**:
- ✅ Immobile creato
- 🖼️ Galleria foto caricata
- 📍 Posizione su mappa (se abilitata)

#### **Test 3.3: Visualizza Mappa Immobili**

**URL**: http://localhost:3000/mappa

- [ ] Mappa Leaflet si carica
- [ ] Markers per ogni immobile
- [ ] Click su marker → Popup con info
- [ ] Clustering automatico se molti immobili
- [ ] Filtri sulla mappa

---

### **4. Richieste Clienti** 📝

**URL**: http://localhost:3000/richieste

#### **Test 4.1: Crea Nuova Richiesta**
1. Click **"Nuova Richiesta"**
2. Seleziona cliente (dropdown o autocomplete)
3. Compila preferenze:
   ```
   Tipo immobile: Appartamento
   Budget: 200000 - 350000€
   MQ minimi: 70
   Zona preferita: Milano Centro, Porta Venezia
   Numero locali: 2-3
   Piano preferito: 2-5
   Box auto: Richiesto
   Balcone: Preferibile
   ```
4. Salva

**Risultato atteso**:
- ✅ Richiesta creata
- 🤖 **Matching AI automatico** si attiva
- 📊 Lista immobili compatibili con score

#### **Test 4.2: Visualizza Match**
- [ ] Vedi lista immobili matchati
- [ ] Score percentuale (es: 85% compatibile)
- [ ] Breakdown score per componente:
  - [ ] Zona (25%)
  - [ ] Budget (20%)
  - [ ] Tipologia (15%)
  - [ ] Caratteristiche (15%)
  - [ ] MQ (10%)
  - [ ] Piano (10%)
  - [ ] Features (5%)
- [ ] Ordine per score decrescente

#### **Test 4.3: Contatta Cliente con Proposta**
1. Click su immobile matchato
2. Click **"Invia Proposta"**
3. Genera email/WhatsApp con dettagli

---

### **5. Edifici/Condomini** 🏢

**URL**: http://localhost:3000/edifici

- [ ] Lista edifici
- [ ] Crea nuovo edificio
- [ ] Associa più unità immobiliari
- [ ] Gestione spese condominiali

---

### **6. Scraping Portali** 🌐

**URL**: http://localhost:3000/scraping

#### **Test 6.1: Avvia Scraping Job**
1. Click **"Nuovo Scraping"**
2. Seleziona portale:
   - [ ] Immobiliare.it
   - [ ] Casa.it
   - [ ] Idealista.it
3. Imposta filtri:
   ```
   Città: Milano
   Tipo: Appartamento
   Prezzo max: 300000€
   ```
4. Avvia job

**Risultato atteso**:
- 🔄 Progress bar in tempo reale
- 📊 Numero annunci trovati
- ✅ Job completato con successo
- 📋 Lista immobili importati

#### **Test 6.2: Visualizza Immobili Scrapati**
- [ ] Vedi immobili importati
- [ ] Link all'annuncio originale
- [ ] Possibilità di importare in database
- [ ] Confronto prezzi tra portali

---

### **7. Attività & Log** 📌

**URL**: http://localhost:3000/attivita

- [ ] Timeline completa azioni
- [ ] Filtro per tipo:
  - [ ] Creazione cliente
  - [ ] Aggiunta immobile
  - [ ] Matching effettuato
  - [ ] Email inviata
  - [ ] WhatsApp inviato
- [ ] Filtro per data
- [ ] Esportazione log CSV/Excel

---

### **8. Settings & Integrazioni** ⚙️

**URL**: http://localhost:3000/settings

#### **Test 8.1: Integrazioni**

**URL**: http://localhost:3000/settings/integrations

**Gmail**:
1. Click **"Connetti Gmail"**
2. OAuth flow Google
3. Autorizza accesso
4. Vedi status: ✅ Connesso

**WhatsApp Business**:
1. Inserisci API credentials:
   ```
   Access Token: [tuo token]
   Phone Number ID: [tuo ID]
   ```
2. Testa invio messaggio
3. Vedi status: ✅ Connesso

**Google Calendar**:
1. Connetti account Google
2. Sincronizza eventi
3. Crea evento da CRM → appare in Calendar

#### **Test 8.2: Custom Fields**

**URL**: http://localhost:3000/settings/custom-fields

1. Click **"Nuovo Campo"**
2. Crea campo personalizzato:
   ```
   Nome: Stato Ristrutturazione
   Tipo: Select
   Entità: Immobile
   Opzioni: Da ristrutturare, Parzialmente ristrutturato, Nuovo
   Richiesto: No
   ```
3. Salva

**Verifica**:
- [ ] Campo appare nel form immobili
- [ ] Valori selezionabili
- [ ] Salvataggio funziona

---

### **9. AI Toolkit** 🛠️

**URL**: http://localhost:3000/tool

**Test AI Agents**:

1. **Property Matcher**:
   - Input: Descrizione richiesta cliente
   - Output: Lista immobili suggeriti con reasoning

2. **Market Analyst**:
   - Input: Zona Milano Centro
   - Output: Analisi prezzi, trends, insights

3. **Email Composer**:
   - Input: Cliente + Immobile
   - Output: Email personalizzata professionale

4. **Property Analyzer**:
   - Input: Dettagli immobile
   - Output: Valutazione, punti forza/deboli, prezzo suggerito

5. **Lead Scorer**:
   - Input: Dati cliente
   - Output: Score lead (A/B/C/D), probabilità chiusura

---

## 🔍 Test Integrazione Database

### **Verifica Dati Persistiti**

```powershell
# Apri Prisma Studio (GUI database)
pnpm prisma:studio
```

Vai su http://localhost:5555

**Controlla tabelle**:
- [ ] `Contact` - Clienti creati
- [ ] `Property` - Immobili inseriti
- [ ] `Request` - Richieste salvate
- [ ] `Match` - Match generati con score
- [ ] `Activity` - Log attività
- [ ] `Tag` - Tags assegnati
- [ ] `ScrapingJob` - Job scraping eseguiti
- [ ] `IntegrationAuth` - Integrazioni connesse

**Verifica**:
- I dati creati via GUI appaiono nel database ✅
- Le relazioni sono corrette (foreign keys) ✅
- I timestamp (createdAt/updatedAt) sono corretti ✅

---

## 📊 Test Performance & UX

### **1. Velocità Caricamento**
- [ ] Dashboard < 2 secondi
- [ ] Liste clienti/immobili < 1 secondo
- [ ] Dettaglio pagina < 1.5 secondi
- [ ] Matching AI < 3 secondi

### **2. Responsiveness**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

### **3. Usabilità**
- [ ] Navigazione intuitiva
- [ ] Form validation chiara
- [ ] Messaggi errore descrittivi
- [ ] Conferme azioni importanti
- [ ] Feedback visivo loading

---

## 🐛 Test Casi Limite

### **1. Validazione Form**
- [ ] Email invalida → Errore chiaro
- [ ] Campi obbligatori vuoti → Errore
- [ ] Budget min > max → Validazione
- [ ] Upload file troppo grande → Errore

### **2. Gestione Errori**
- [ ] Immobile senza foto → Placeholder
- [ ] Cliente senza richieste → Messaggio vuoto
- [ ] API offline → Messaggio friendly
- [ ] Timeout → Retry automatico

### **3. Edge Cases**
- [ ] 0 immobili in database → Empty state
- [ ] 1000+ immobili → Paginazione + Performance
- [ ] Matching nessun risultato → Messaggio
- [ ] Scraping portale down → Errore gestito

---

## ✅ Checklist Funzionalità Completa

### **Core Features**
- [ ] ✅ Dashboard analytics
- [ ] ✅ CRUD Clienti
- [ ] ✅ CRUD Immobili
- [ ] ✅ CRUD Richieste
- [ ] ✅ Matching AI con score
- [ ] ✅ Gestione edifici
- [ ] ✅ Scraping portali (3)
- [ ] ✅ Mappa interattiva
- [ ] ✅ Activity log
- [ ] ✅ Custom fields

### **Integrazioni**
- [ ] 🟡 Gmail OAuth (richiede credenziali reali)
- [ ] 🟡 WhatsApp Business (richiede account)
- [ ] 🟡 Google Calendar (richiede auth)

### **AI Features**
- [ ] ✅ Property Matcher
- [ ] ✅ Market Analyst
- [ ] ✅ Email Composer
- [ ] ✅ Property Analyzer
- [ ] ✅ Lead Scorer

### **UX/UI**
- [ ] ✅ Design moderno shadcn/ui
- [ ] ✅ Tema chiaro/scuro
- [ ] ✅ Icone Lucide React
- [ ] ✅ Animazioni smooth
- [ ] ✅ Responsive design

---

## 📝 Raccolta Bug & Feedback

Mentre testi, annota:

### **Bug Trovati**
```
1. [Pagina] - [Descrizione] - [Severità: Alta/Media/Bassa]
   Passi per riprodurre:
   - Step 1
   - Step 2
   Risultato atteso:
   Risultato ottenuto:

2. ...
```

### **Feedback UX**
```
- La navigazione nella sezione X è confusa
- Il form Y potrebbe essere più semplice
- Manca un pulsante per Z
- ...
```

### **Feature Request**
```
- Vorrei esportare immobili in PDF
- Necessario filtro avanzato per...
- Integrazione con [servizio]
- ...
```

---

## 🎯 Criteri Successo Test

Il test è **SUPERATO** se:

✅ **Funzionalità Core**: Tutte funzionanti senza crash
✅ **Database**: Dati persistiti correttamente
✅ **Performance**: Caricamenti < 3 secondi
✅ **UX**: Navigazione fluida e intuitiva
✅ **Errori**: Gestiti con messaggi chiari
✅ **Responsive**: Funziona su tutti i device

---

## 🆘 Risoluzione Problemi Comuni

### **Errore: Prisma Client not found**
```powershell
pnpm prisma:generate
```

### **Errore: Database locked**
```powershell
# Ferma il server
Ctrl+C

# Rimuovi lock
rm packages/database/prisma/dev.db-journal

# Riavvia
pnpm dev:web
```

### **Errore: Port 3000 in use**
```powershell
# Ferma processo sulla porta 3000
netstat -ano | findstr :3000
taskkill /PID [numero] /F

# Oppure usa porta diversa
cd apps/web/frontend
pnpm next dev -p 3001
```

### **Pagina bianca / Errore 500**
1. Controlla console browser (F12)
2. Controlla console Node.js
3. Verifica DATABASE_URL in .env
4. Riavvia server

---

## 📞 Supporto

Se trovi problemi durante i test:
1. Controlla la sezione Troubleshooting
2. Verifica i log (console + terminal)
3. Riporta issue con screenshot e passi per riprodurre

---

**Versione**: 4.0.0 (Production Ready)
**Data Guida**: 2025-11-15
**Tempo Test Completo**: ~2-3 ore
