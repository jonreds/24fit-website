# 24FIT - Riepilogo Sistema

## Panoramica

Sistema completo per la gestione di una palestra 24/7 con:
- **Sito Web** pubblico per vendita abbonamenti
- **Dashboard Admin** per gestione clienti e piani
- **API Mobile** per app Flutter
- **Sistema Email** transazionali
- **Push Notifications** via Firebase

---

## Architettura Tecnica

| Componente | Tecnologia |
|------------|------------|
| Frontend | Next.js 16 + Tailwind CSS 4 |
| Backend | Next.js API Routes |
| Database | MySQL (Prisma 7 ORM) |
| Pagamenti | Stripe Checkout + Webhooks |
| Email | Resend + React Email |
| Push | Firebase Cloud Messaging |
| Fatturazione | Fatture in Cloud (predisposto) |

---

## Struttura Database (Prisma)

### Modelli Principali

| Modello | Descrizione |
|---------|-------------|
| `clienti` | Clienti/abbonati con dati anagrafici, abbonamento, pause, ban |
| `users` | Utenti dashboard (superadmin, admin, manager, staff) |
| `piani` | Piani abbonamento con prezzi, durata, giorni pausa |
| `note_cliente` | Note gerarchiche sui clienti |
| `pause_abbonamento` | Storico pause abbonamento |
| `accessi` | Log accessi in palestra |
| `fatture` | Fatture emesse |
| `password_reset_tokens` | Token per reset password |

### Gerarchia Ruoli

```
superadmin > admin > manager > staff
```

- **superadmin**: Accesso totale, può impostare password direttamente
- **admin**: Gestione clienti, piani, ban, note
- **manager**: Gestione clienti limitata
- **staff**: Solo visualizzazione

---

## API Endpoints

### Pubbliche

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/checkout` | POST | Crea sessione Stripe Checkout |
| `/api/webhook` | POST | Webhook Stripe per conferma pagamento |
| `/api/piani` | GET | Lista piani pubblici |
| `/api/daily-pass` | POST | Acquisto day pass |

### Mobile (`/api/mobile/`)

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/auth/login` | POST | Login cliente |
| `/auth/forgot-password` | POST | Richiesta reset password |
| `/auth/reset-password` | POST | Reset password con token |
| `/abbonamento` | GET | Dettagli abbonamento |
| `/abbonamento` | POST | Gestione pause (start/end) |
| `/profilo` | GET, PUT | Lettura/modifica profilo |
| `/fcm-token` | POST, DELETE | Registrazione token push |

### Dashboard (`/api/dashboard/`)

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/auth/login` | POST | Login admin |
| `/auth/me` | GET | Dati utente corrente |
| `/stats` | GET | Statistiche dashboard |
| `/clienti` | GET | Lista clienti con filtri |
| `/clienti/[id]` | GET, PUT | Dettaglio/modifica cliente |
| `/clienti/[id]/ban` | POST | Ban/unban cliente |
| `/clienti/[id]/note` | GET, POST, PUT, DELETE | CRUD note |
| `/clienti/[id]/password` | POST | Reset password (email/link/diretta) |
| `/piani` | GET, POST, PUT, DELETE | CRUD piani |
| `/push` | GET, POST | Statistiche e invio notifiche |

---

## Pagine Frontend

### Sito Pubblico

| Pagina | Path | Descrizione |
|--------|------|-------------|
| Home | `/` | Landing page |
| Abbonamenti | `/abbonamenti` | Prezzi e piani |
| Palestre | `/palestre` | Lista sedi |
| Palestra Dettaglio | `/palestre/[slug]` | Dettaglio sede |
| Daily Pass | `/daily-pass` | Acquisto giornaliero |
| Onboarding | `/onboarding` | Completamento dati post-acquisto |
| Checkout Success | `/checkout/success` | Conferma pagamento |
| Privacy | `/privacy` | Privacy policy |
| Termini | `/termini` | Termini di servizio |
| Codice Etico | `/codice-etico` | Regolamento palestra |

### Dashboard Admin

| Pagina | Path | Descrizione |
|--------|------|-------------|
| Login | `/dashboard/login` | Accesso admin |
| Home | `/dashboard` | Statistiche e attività |
| Clienti | `/dashboard/clienti` | Gestione clienti |
| Cliente Dettaglio | `/dashboard/clienti/[id]` | Scheda cliente completa |
| Piani | `/dashboard/piani` | Gestione abbonamenti |

---

## Servizi (`/src/lib/`)

| File | Funzionalità |
|------|--------------|
| `prisma.ts` | Client Prisma con adapter MariaDB |
| `auth.ts` | Autenticazione JWT, ruoli, permessi note |
| `email.ts` | Invio email con template React |
| `push-notifications.ts` | Invio push FCM con template |
| `firebase-admin.ts` | Inizializzazione Firebase Admin |
| `fattureincloud.ts` | Integrazione Fatture in Cloud |
| `api.ts` | Helper API generici |

---

## Template Email (`/src/emails/`)

| Template | Trigger |
|----------|---------|
| `WelcomeEmail` | Nuovo abbonamento |
| `PasswordResetEmail` | Richiesta reset password |
| `SubscriptionConfirmEmail` | Conferma pagamento |
| `SubscriptionExpiringEmail` | 7/3/1 giorni prima scadenza |
| `PauseConfirmEmail` | Inizio/fine pausa |
| `BanNotificationEmail` | Ban/unban account |

---

## Template Push Notifications

| Funzione | Trigger |
|----------|---------|
| `sendWelcomePush` | Nuovo abbonamento |
| `sendExpiringSubscriptionPush` | Scadenza imminente |
| `sendPauseStartedPush` | Inizio pausa |
| `sendPauseEndingPush` | Fine pausa imminente |
| `sendBanPush` | Account sospeso |
| `sendUnbanPush` | Account riattivato |
| `sendPromoPush` | Promozioni broadcast |

---

## Variabili Ambiente

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL="mysql://user:pass@host:3306/db"

# Email
RESEND_API_KEY=re_...

# JWT
JWT_SECRET=your-secret-key

# Firebase (Push)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Fatture in Cloud
FIC_ACCESS_TOKEN=...
FIC_COMPANY_ID=...

# URLs
NEXT_PUBLIC_BASE_URL=https://24fit.it
NEXT_PUBLIC_API_URL=https://api.24fit.it
```

---

## Stato Implementazione

### Completato

- [x] Checkout Stripe con webhook
- [x] Password hashata e salvata in DB
- [x] Schema Prisma completo
- [x] API Mobile (login, profilo, abbonamento, pause, reset password)
- [x] API Dashboard (clienti, piani, note, ban, password, statistiche)
- [x] Dashboard UI completa
- [x] Template email
- [x] Push notifications setup

### Da Completare (Phase 3)

- [ ] Cron job per email scadenza abbonamenti
- [ ] Cron job per push notifications scadenze
- [ ] Cron job per terminare pause scadute
- [ ] Integrazione Fatture in Cloud
- [ ] Gestione accessi (QR code validation)
- [ ] Dashboard: gestione utenti admin
- [ ] Dashboard: pagina notifiche push
- [ ] Dashboard: esportazione CSV clienti
- [ ] Seed script per primo admin
- [ ] Deploy e test su server produzione

---

## Flusso Acquisto Abbonamento

```
1. Cliente sceglie piano su /abbonamenti
2. Clic su "Abbonati" → /api/checkout
3. Redirect a Stripe Checkout
4. Pagamento completato → webhook
5. Webhook crea cliente in DB con password hashata
6. Email di benvenuto inviata
7. Redirect a /checkout/success
8. Cliente completa onboarding (documenti)
```

---

## Prossimi Passi

1. **Migrare database** su server produzione
2. **Creare admin iniziale** con seed script
3. **Configurare Firebase** per push notifications
4. **Implementare cron jobs** per automazioni
5. **Testare flusso completo** end-to-end
