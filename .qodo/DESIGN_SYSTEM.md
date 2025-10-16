# 🎨 Design System - RealEstate AI

## 📋 Panoramica

Questo documento definisce il design system completo dell'applicazione RealEstate AI, includendo palette colori, tipografia, spaziature, animazioni, componenti e pattern UI/UX.

---

## 🎨 Palette Colori

### Colori Primari

#### Light Mode
```css
--background: 210 20% 98%        /* Sfondo principale - grigio chiaro */
--foreground: 215 25% 15%        /* Testo principale - blu scuro */
--card: 0 0% 100%                /* Sfondo card - bianco */
--primary: 215 90% 25%           /* Blu brand principale */
--accent: 175 75% 45%            /* Turchese/Cyan per AI features */
```

#### Dark Mode
```css
--background: 215 30% 8%         /* Sfondo principale - blu molto scuro */
--foreground: 210 20% 95%        /* Testo principale - grigio chiaro */
--card: 215 25% 12%              /* Sfondo card - blu scuro */
--primary: 215 90% 60%           /* Blu brand (più chiaro) */
--accent: 175 75% 50%            /* Turchese/Cyan (più chiaro) */
```

### Colori Semantici

#### Stati Generali
```css
--success: 142 76% 45%           /* Verde - Successo, Disponibile */
--warning: 38 92% 50%            /* Arancione - Attenzione, In attesa */
--destructive: 0 84% 60%         /* Rosso - Errore, Urgente */
--muted: 210 15% 95%             /* Grigio - Disabilitato, Secondario */
```

#### Priorità
```css
--priority-urgent: 0 84% 60%     /* 🔴 Rosso - Urgente */
--priority-high: 38 92% 50%      /* 🟡 Arancione - Alta */
--priority-medium: 215 90% 50%   /* 🔵 Blu - Media */
--priority-low: 142 76% 45%      /* 🟢 Verde - Bassa */
```

#### Status Clienti
```css
--client-hot: 0 84% 60%          /* 🔥 Rosso - Hot (alta priorità) */
--client-warm: 38 92% 50%        /* 🌡️ Arancione - Warm (interessato) */
--client-cold: 215 90% 50%       /* ❄️ Blu - Cold (da riattivare) */
--client-inactive: 215 15% 50%   /* 💤 Grigio - Inattivo */
```

#### Status Immobili
```css
--property-available: 142 76% 45%   /* 🟢 Verde - Disponibile */
--property-reserved: 38 92% 50%     /* 🟡 Arancione - Riservato */
--property-sold: 215 15% 50%        /* ⚪ Grigio - Venduto */
--property-draft: 215 15% 70%       /* ⚪ Grigio chiaro - Bozza */
```

#### Match Score
```css
--match-excellent: 142 76% 45%   /* 🟢 Verde - Eccellente (90-100%) */
--match-good: 84 81% 44%         /* 🟢 Verde lime - Buono (70-89%) */
--match-medium: 38 92% 50%       /* 🟡 Arancione - Medio (50-69%) */
--match-low: 0 84% 60%           /* 🔴 Rosso - Basso (0-49%) */
```

### Gradienti

```css
--gradient-primary: linear-gradient(135deg, hsl(215 90% 25%) 0%, hsl(215 90% 40%) 100%)
--gradient-accent: linear-gradient(135deg, hsl(175 75% 45%) 0%, hsl(175 75% 60%) 100%)
--gradient-subtle: linear-gradient(180deg, hsl(210 20% 98%) 0%, hsl(210 15% 95%) 100%)
```

**Utilizzo:**
- `gradient-primary`: Titoli, CTA principali, elementi hero
- `gradient-accent`: Features AI, elementi interattivi speciali
- `gradient-subtle`: Sfondi pagina, sezioni

---

## 🔤 Tipografia

### Font Family
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### Scale Tipografica

#### Titoli
```css
text-4xl: 2.25rem (36px)  /* font-bold - Hero titles */
text-3xl: 1.875rem (30px) /* font-bold - Page titles */
text-2xl: 1.5rem (24px)    /* font-bold - Section titles */
text-xl: 1.25rem (20px)    /* font-bold - Card titles */
text-lg: 1.125rem (18px)   /* font-semibold - Subtitles */
```

#### Body
```css
text-base: 1rem (16px)     /* font-normal - Body text */
text-sm: 0.875rem (14px)   /* font-normal - Small text */
text-xs: 0.75rem (12px)    /* font-normal - Captions */
```

### Font Weights
```css
font-normal: 400   /* Body text */
font-medium: 500   /* Emphasis */
font-semibold: 600 /* Subtitles */
font-bold: 700     /* Titles */
```

### Line Heights
```css
leading-tight: 1.25    /* Titoli */
leading-normal: 1.5    /* Body text */
leading-relaxed: 1.625 /* Paragrafi lunghi */
```

---

## 📏 Spaziature

### Scale di Spaziatura
```css
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
```

### Utilizzo Comune

#### Padding
```css
p-2: 8px    /* Pulsanti piccoli */
p-4: 16px   /* Card, contenitori */
p-6: 24px   /* Sezioni */
p-8: 32px   /* Container principali */
```

#### Gap
```css
gap-1: 4px   /* Icone ravvicinate */
gap-2: 8px   /* Elementi inline */
gap-4: 16px  /* Card grid */
gap-6: 24px  /* Sezioni */
gap-8: 32px  /* Layout principali */
```

#### Margin
```css
mb-2: 8px   /* Spacing minimo */
mb-4: 16px  /* Spacing standard */
mb-6: 24px  /* Spacing sezioni */
mb-8: 32px  /* Spacing grandi sezioni */
```

---

## 🔲 Border Radius

```css
--radius: 0.75rem (12px)           /* Default */
rounded-sm: calc(var(--radius) - 4px)  /* 8px - Piccoli elementi */
rounded-md: calc(var(--radius) - 2px)  /* 10px - Pulsanti */
rounded-lg: var(--radius)              /* 12px - Card */
rounded-xl: 1rem (16px)                /* Elementi grandi */
rounded-2xl: 1.5rem (24px)             /* Hero sections */
rounded-full: 9999px                   /* Cerchi, pills */
```

---

## 🌑 Ombre (Shadows)

```css
shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05)           /* Elementi sottili */
shadow: 0 4px 6px -1px rgba(0,0,0,0.1)            /* Card standard */
shadow-md: 0 10px 15px -3px rgba(0,0,0,0.1)       /* Card hover */
shadow-lg: 0 20px 25px -5px rgba(0,0,0,0.1)       /* Modali, dropdown */
shadow-glow: 0 0 40px hsl(215 90% 60% / 0.2)      /* Effetto glow */
shadow-accent: 0 8px 20px -4px hsl(175 75% 45% / 0.3) /* Accent glow */
```

**Utilizzo:**
- `shadow-sm`: Bordi sottili, separatori
- `shadow`: Card, pulsanti
- `shadow-md`: Hover states
- `shadow-lg`: Popover, dialog
- `shadow-glow`: Elementi primari con focus
- `shadow-accent`: Features AI, elementi speciali

---

## 🎬 Animazioni

### Keyframes Disponibili

#### Fade In
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Utilizzo: animate-fade-in */
/* Durata: 0.3s */
```

#### Fade In Up
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Utilizzo: animate-fade-in-up */
/* Durata: 0.5s */
```

#### Scale In
```css
@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
/* Utilizzo: animate-scale-in */
/* Durata: 0.2s */
```

#### Slide In Right
```css
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
/* Utilizzo: animate-slide-in-right */
/* Durata: 0.3s */
```

#### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px hsl(var(--primary-glow) / 0.3); }
  50% { box-shadow: 0 0 30px hsl(var(--primary-glow) / 0.5); }
}
/* Utilizzo: animate-pulse-glow */
/* Durata: 2s infinite */
```

#### Shimmer
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
/* Utilizzo: animate-shimmer */
/* Durata: 2s infinite */
/* Per skeleton loading */
```

### Transizioni

```css
transition-all: all 0.3s ease       /* Transizione universale */
transition-colors: colors 0.2s ease /* Solo colori */
transition-transform: transform 0.2s ease /* Solo trasformazioni */
transition-opacity: opacity 0.2s ease /* Solo opacità */
```

### Hover Effects Standard

```css
/* Card Hover */
hover:shadow-md hover:scale-105 transition-all

/* Button Hover */
hover:bg-primary/90 transition-colors

/* Link Hover */
hover:text-primary hover:underline transition-colors

/* Icon Hover */
hover:scale-110 transition-transform
```

---

## 📱 Breakpoints Responsive

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Pattern Responsive Comuni

```css
/* Grid Responsive */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Flex Responsive */
flex flex-col md:flex-row

/* Spacing Responsive */
p-4 md:p-6 lg:p-8

/* Text Size Responsive */
text-2xl md:text-3xl lg:text-4xl

/* Visibility Responsive */
hidden md:block  /* Nascosto su mobile, visibile da tablet */
block md:hidden  /* Visibile su mobile, nascosto da tablet */
```

---

## 🧩 Componenti UI Standard

### Button Variants

#### Primary
```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Action
</Button>
```

#### Secondary
```tsx
<Button variant="secondary">
  Secondary Action
</Button>
```

#### Outline
```tsx
<Button variant="outline">
  Outline Action
</Button>
```

#### Ghost
```tsx
<Button variant="ghost">
  Ghost Action
</Button>
```

#### Destructive
```tsx
<Button variant="destructive">
  Delete
</Button>
```

### Card Standard

```tsx
<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle>Titolo Card</CardTitle>
    <CardDescription>Descrizione breve</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenuto */}
  </CardContent>
</Card>
```

### Badge Variants

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Urgent</Badge>
<Badge variant="outline">Outline</Badge>
```

### Input Standard

```tsx
<Input 
  placeholder="Cerca..." 
  className="pl-10"  /* Se con icona */
/>
```

---

## 🎯 Pattern UI/UX

### Header Pattern (Toolbar)

```tsx
<header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
  <div className="container flex h-16 items-center justify-between px-4">
    {/* Left side */}
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        RealEstate AI
      </h1>
      {/* Navigation icons */}
    </div>
    
    {/* Right side */}
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  </div>
</header>
```

### Page Layout Pattern

```tsx
<div className="min-h-screen bg-gradient-subtle">
  {/* Header */}
  <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
    <div className="container flex h-16 items-center gap-4 px-4">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Home
      </Button>
      <h1 className="text-xl font-bold">Page Title</h1>
    </div>
  </header>

  {/* Content */}
  <div className="container px-4 py-8">
    {/* Search and Actions Bar */}
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Search */}
      {/* Actions */}
    </div>

    {/* Stats Cards (optional) */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Stat cards */}
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Content cards */}
    </div>
  </div>
</div>
```

### Search Bar Pattern

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

### Stats Card Pattern

```tsx
<Card>
  <CardHeader className="pb-3">
    <CardDescription>Label</CardDescription>
    <CardTitle className="text-3xl">24</CardTitle>
  </CardHeader>
</Card>
```

### Action Bar Pattern

```tsx
<div className="flex flex-col md:flex-row gap-4 mb-8">
  <div className="relative flex-1">
    {/* Search */}
  </div>
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

---

## 🎨 Icone (Lucide React)

### Icone Comuni

```tsx
import {
  Home,           // Immobili
  Users,          // Clienti
  Wrench,         // Tool
  Settings,       // Impostazioni
  Bell,           // Notifiche
  HelpCircle,     // Help
  Command,        // Shortcut
  Search,         // Ricerca
  Filter,         // Filtri
  Plus,           // Aggiungi
  ArrowLeft,      // Indietro
  MapPin,         // Posizione
  Calendar,       // Calendario
  Phone,          // Telefono
  Mail,           // Email
  Zap,            // Azioni rapide
  TrendingUp,     // Crescita
  Euro,           // Prezzo
  Bed,            // Locali
  Bath,           // Bagni
  Square,         // Metratura
} from "lucide-react";
```

### Dimensioni Standard

```tsx
className="h-4 w-4"  /* Icone piccole (16px) - Pulsanti, inline */
className="h-5 w-5"  /* Icone medie (20px) - Toolbar, card */
className="h-6 w-6"  /* Icone grandi (24px) - Hero, features */
className="h-8 w-8"  /* Icone extra large (32px) - Placeholder */
```

---

## 📐 Layout Grid

### Container
```css
container: max-width responsive + center + padding 2rem
```

### Grid Patterns

```css
/* 2 colonne */
grid grid-cols-1 lg:grid-cols-2 gap-6

/* 3 colonne */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* 4 colonne */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4

/* Auto-fit responsive */
grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6
```

---

## ✅ Checklist Design

Quando crei un nuovo componente o pagina, assicurati di:

- [ ] Usare colori dalla palette definita
- [ ] Applicare border-radius coerente (rounded-lg per card)
- [ ] Aggiungere ombre appropriate (shadow per card)
- [ ] Implementare hover states (hover:shadow-md, hover:scale-105)
- [ ] Usare animazioni fade-in per elementi che appaiono
- [ ] Rendere responsive (mobile-first)
- [ ] Aggiungere transizioni smooth (transition-all)
- [ ] Usare icone lucide-react con dimensioni coerenti
- [ ] Applicare spacing consistente (gap-4, p-6, mb-8)
- [ ] Testare in dark mode

---

**Ultimo aggiornamento**: 2024
**Versione**: 1.0.0
