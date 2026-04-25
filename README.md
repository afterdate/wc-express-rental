# WC-Express Vermietungssoftware

Eine moderne Vermietungsplattform für mobile WC-Anhänger, Duschanhänger, Küchen und mehr.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Deployment:** Vercel

## Features

### Öffentlicher Bereich
- Landing Page mit WC-Express Branding
- Anhänger-Katalog mit Filter- und Suchfunktion
- Verfügbarkeitskalender pro Anhänger
- Online-Buchung mit Datumsauswahl
- Buchungsbestätigung

### Admin Dashboard
- Übersicht aller Buchungen
- Buchungsstatus verwalten (Bestätigen, Ablehnen, Abschließen)
- Anhänger verwalten (CRUD)
- Statistiken und Umsatzübersicht

## Setup

### 1. Supabase Projekt einrichten

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Kopiere die Project URL und den Anon Key
3. Führe das SQL-Schema aus (`supabase/schema.sql`) im SQL Editor aus

### 2. Umgebungsvariablen

Erstelle eine `.env.local` Datei:

```env
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

### 3. Lokale Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App läuft auf `http://localhost:3000`

### 4. Deployment auf Vercel

1. Pushe das Repository zu GitHub
2. Verbinde das Repository mit Vercel
3. Füge die Umgebungsvariablen in Vercel hinzu
4. Deploy!

## Datenbank-Schema

### Tabellen

- **trailers** - Alle verfügbaren Anhänger
- **bookings** - Buchungen von Kunden
- **availability_blocks** - Blockierte Zeiträume (Wartung, etc.)

### RLS Policies

Die Datenbank hat Row Level Security aktiviert:
- Öffentlicher Lesezugriff auf Anhänger
- Öffentliches Erstellen von Buchungen
- Admin-Zugriff über Authentifizierung

## Anhänger-Typen

- `toilet` - WC-Anhänger
- `shower` - Duschanhänger
- `kitchen` - Küchenanhänger
- `changing` - Umkleidekabinen

## Lizenz

MIT
