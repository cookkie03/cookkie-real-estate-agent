# 🧩 Guida Componenti UI - RealEstate AI

## 📋 Panoramica

Questa guida collega tutti i componenti UI dell'applicazione al Design System, fornendo esempi pratici e best practices per l'utilizzo.

---

## 🎨 Componenti Base (shadcn/ui)

### Button

#### Varianti Disponibili

```tsx
import { Button } from "@/components/ui/button";

// Primary - Azioni principali
<Button>
  Salva
</Button>

// Secondary - Azioni secondarie
<Button variant="secondary">
  Annulla
</Button>

// Outline - Azioni terziarie
<Button variant="outline">
  Modifica
</Button>

// Ghost - Azioni sottili
<Button variant="ghost">
  Chiudi
</Button>

// Destructive - Azioni distruttive
<Button variant="destructive">
  Elimina
</Button>

// Link - Stile link
<Button variant="link">
  Scopri di più
</Button>
```

#### Dimensioni

```tsx
// Small - Toolbar, inline
<Button size="sm">Piccolo</Button>

// Default - Standard
<Button>Normale</Button>

// Large - CTA principali
<Button size="lg">Grande</Button>

// Icon - Solo icona
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

#### Con Icone

```tsx
import { Plus, ArrowRight } from "lucide-react";

// Icona a sinistra
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Aggiungi
</Button>

// Icona a destra
<Button>
  Continua
  <ArrowRight className="h-4 w-4 ml-2" />
</Button>

// Solo icona
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

#### Stati

```tsx
// Loading
<Button disabled>
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Caricamento...
</Button>

// Disabled
<Button disabled>
  Non disponibile
</Button>
```

---

### Card

#### Struttura Base

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Titolo Card</CardTitle>
    <CardDescription>Descrizione breve</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenuto principale */}
  </CardContent>
  <CardFooter>
    {/* Azioni o info aggiuntive */}
  </CardFooter>
</Card>
```

#### Card Interattiva

```tsx
<Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
  {/* Contenuto */}
</Card>
```

#### Card con Immagine

```tsx
<Card className="overflow-hidden">
  <div className="aspect-video bg-muted relative">
    <img src="/image.jpg" alt="..." className="object-cover w-full h-full" />
    <div className="absolute top-2 right-2">
      <Badge>Nuovo</Badge>
    </div>
  </div>
  <CardHeader>
    <CardTitle>Titolo</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenuto */}
  </CardContent>
</Card>
```

#### Stats Card

```tsx
<Card>
  <CardHeader className="pb-3">
    <CardDescription>Totale Immobili</CardDescription>
    <CardTitle className="text-3xl">24</CardTitle>
  </CardHeader>
</Card>

// Con colore
<Card>
  <CardHeader className="pb-3">
    <CardDescription>Disponibili</CardDescription>
    <CardTitle className="text-3xl text-green-600">18</CardTitle>
  </CardHeader>
</Card>
```

---

### Badge

#### Varianti

```tsx
import { Badge } from "@/components/ui/badge";

// Default
<Badge>Default</Badge>

// Secondary
<Badge variant="secondary">Secondary</Badge>

// Destructive
<Badge variant="destructive">Urgente</Badge>

// Outline
<Badge variant="outline">Outline</Badge>
```

#### Badge con Colori Custom

```tsx
// Success
<Badge className="bg-success text-success-foreground">
  Disponibile
</Badge>

// Warning
<Badge className="bg-warning text-warning-foreground">
  In Attesa
</Badge>

// Client Status
<Badge className="bg-client-hot text-white">
  Hot
</Badge>

<Badge className="bg-client-warm text-white">
  Warm
</Badge>

<Badge className="bg-client-cold text-white">
  Cold
</Badge>
```

---

### Input

#### Input Base

```tsx
import { Input } from "@/components/ui/input";

<Input 
  type="text"
  placeholder="Inserisci testo..."
/>
```

#### Input con Icona

```tsx
import { Search } from "lucide-react";

<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input 
    placeholder="Cerca..." 
    className="pl-10"
  />
</div>
```

#### Input con Label

```tsx
import { Label } from "@/components/ui/label";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email"
    type="email"
    placeholder="nome@esempio.com"
  />
</div>
```

---

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="all" className="w-full">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="all">
      Tutti
      <Badge variant="secondary" className="ml-2">24</Badge>
    </TabsTrigger>
    <TabsTrigger value="hot">Hot</TabsTrigger>
    <TabsTrigger value="warm">Warm</TabsTrigger>
    <TabsTrigger value="cold">Cold</TabsTrigger>
  </TabsList>
  
  <TabsContent value="all">
    {/* Contenuto tab Tutti */}
  </TabsContent>
  <TabsContent value="hot">
    {/* Contenuto tab Hot */}
  </TabsContent>
</Tabs>
```

---

### Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Apri Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titolo Dialog</DialogTitle>
      <DialogDescription>
        Descrizione del dialog
      </DialogDescription>
    </DialogHeader>
    {/* Contenuto */}
  </DialogContent>
</Dialog>
```

---

### Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Seleziona..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opzione 1</SelectItem>
    <SelectItem value="option2">Opzione 2</SelectItem>
    <SelectItem value="option3">Opzione 3</SelectItem>
  </SelectContent>
</Select>
```

---

## 🎯 Componenti Custom

### StatPill (Quick Actions)

```tsx
import { StatPill } from "@/components/features/dashboard/StatPill";
import { Phone } from "lucide-react";

<StatPill
  label="Chiamate urgenti"
  value={5}
  icon={Phone}
  variant="urgent"
  onClick={() => router.push("/actions?type=urgent")}
/>
```

**Varianti disponibili:**
- `urgent` - Rosso
- `success` - Verde
- `warning` - Arancione
- `default` - Blu

---

### MatchScoreCircle

```tsx
import { MatchScoreCircle } from "@/components/common/MatchScoreCircle";

<MatchScoreCircle score={85} size="md" />
```

**Dimensioni:**
- `sm` - Piccolo
- `md` - Medio (default)
- `lg` - Grande

**Colori automatici:**
- 90-100%: Verde (excellent)
- 70-89%: Verde lime (good)
- 50-69%: Arancione (medium)
- 0-49%: Rosso (low)

---

### PriorityBadge

```tsx
import { PriorityBadge } from "@/components/common/PriorityBadge";

<PriorityBadge priority="urgent" />
<PriorityBadge priority="high" />
<PriorityBadge priority="medium" />
<PriorityBadge priority="low" />
```

---

### StatusBadge

```tsx
import { StatusBadge } from "@/components/common/StatusBadge";

// Per immobili
<StatusBadge status="available" type="property" />
<StatusBadge status="reserved" type="property" />
<StatusBadge status="sold" type="property" />

// Per clienti
<StatusBadge status="hot" type="client" />
<StatusBadge status="warm" type="client" />
<StatusBadge status="cold" type="client" />
<StatusBadge status="inactive" type="client" />
```

---

## 📐 Layout Patterns

### Page Header

```tsx
<header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
  <div className="container flex h-16 items-center gap-4 px-4">
    <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Home
    </Button>
    <h1 className="text-xl font-bold">Titolo Pagina</h1>
  </div>
</header>
```

### Search Bar

```tsx
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Cerca..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="pl-10"
  />
</div>
```

### Action Bar

```tsx
<div className="flex flex-col md:flex-row gap-4 mb-8">
  {/* Search */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input placeholder="Cerca..." className="pl-10" />
  </div>
  
  {/* Actions */}
  <div className="flex gap-2">
    <Button variant="outline">
      <Filter className="h-4 w-4 mr-2" />
      Filtri
    </Button>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Nuovo
    </Button>
  </div>
</div>
```

### Stats Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <Card>
    <CardHeader className="pb-3">
      <CardDescription>Totale</CardDescription>
      <CardTitle className="text-3xl">24</CardTitle>
    </CardHeader>
  </Card>
  {/* Altri stats */}
</div>
```

### Content Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id} className="hover:shadow-lg transition-all">
      {/* Card content */}
    </Card>
  ))}
</div>
```

---

## 🎨 Styling Patterns

### Hover Effects

```tsx
// Card hover
className="hover:shadow-lg hover:scale-105 transition-all"

// Button hover
className="hover:bg-primary/90 transition-colors"

// Link hover
className="hover:text-primary hover:underline transition-colors"

// Icon hover
className="hover:scale-110 transition-transform"
```

### Animazioni

```tsx
// Fade in
className="animate-fade-in"

// Fade in up
className="animate-fade-in-up"

// Con delay
className="animate-fade-in-up"
style={{ animationDelay: "0.1s" }}

// Scale in
className="animate-scale-in"

// Pulse glow
className="animate-pulse-glow"
```

### Responsive

```tsx
// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Flex responsive
className="flex flex-col md:flex-row gap-4"

// Spacing responsive
className="p-4 md:p-6 lg:p-8"

// Text size responsive
className="text-2xl md:text-3xl lg:text-4xl"

// Visibility responsive
className="hidden md:block"  // Nascosto mobile, visibile desktop
className="block md:hidden"  // Visibile mobile, nascosto desktop
```

---

## ✅ Best Practices

### 1. Usa Componenti Esistenti
Prima di creare un nuovo componente, verifica se esiste già in `src/components/ui/` o `src/components/common/`.

### 2. Mantieni Coerenza
Usa sempre le classi dal design system:
- Colori: `bg-primary`, `text-success`, ecc.
- Spacing: `gap-4`, `p-6`, `mb-8`
- Shadows: `shadow-md`, `shadow-lg`
- Radius: `rounded-lg`, `rounded-xl`

### 3. Responsive First
Progetta sempre mobile-first:
```tsx
// ✅ Corretto
className="text-base md:text-lg lg:text-xl"

// ❌ Evita
className="text-xl md:text-base"
```

### 4. Accessibilità
- Usa `aria-label` per icone senza testo
- Aggiungi `title` ai pulsanti
- Usa componenti semantici (`<button>`, `<nav>`, ecc.)

### 5. Performance
- Usa `"use client"` solo quando necessario
- Lazy load componenti pesanti
- Ottimizza immagini

---

## 🔗 Collegamenti

- **Design System**: `.qodo/DESIGN_SYSTEM.md`
- **Page Template**: `.qodo/PAGE_TEMPLATE.tsx`
- **Componenti shadcn/ui**: `src/components/ui/`
- **Componenti custom**: `src/components/common/` e `src/components/features/`

---

**Ultimo aggiornamento**: 2024
**Versione**: 1.0.0
