# Phase 3 - Piano di Implementazione

## Obiettivi
Completare il sistema con automazioni, integrazioni mancanti e funzionalità aggiuntive per rendere il sistema pronto per la produzione.

---

## Task List

### 1. Seed Script e Setup Iniziale
**Priorità: ALTA**

- [ ] Creare script `prisma/seed.ts` per:
  - Creare primo utente superadmin
  - Creare piani base (Trimestrale 7gg, Semestrale 14gg, Annuale 30gg)
  - Popolare dati demo (opzionale)

- [ ] Aggiungere comando `npm run db:seed`

### 2. Cron Jobs / Automazioni
**Priorità: ALTA**

#### 2.1 Email Scadenza Abbonamenti
- [ ] Endpoint `/api/cron/expiring-subscriptions`
- [ ] Invia email a 7 giorni, 3 giorni, 1 giorno dalla scadenza
- [ ] Flag su cliente per evitare invii duplicati
- [ ] Configurabile da Vercel Cron o crontab esterno

#### 2.2 Push Notifications Scadenze
- [ ] Endpoint `/api/cron/expiring-push`
- [ ] Invia push notification in parallelo alle email
- [ ] Solo a clienti con `push_enabled = true`

#### 2.3 Gestione Pause Scadute
- [ ] Endpoint `/api/cron/expired-pauses`
- [ ] Termina automaticamente pause scadute
- [ ] Invia email/push di notifica
- [ ] Estende scadenza abbonamento

#### 2.4 Pulizia Token Scaduti
- [ ] Endpoint `/api/cron/cleanup-tokens`
- [ ] Elimina `password_reset_tokens` scaduti

### 3. Integrazione Fatture in Cloud
**Priorità: MEDIA**

- [ ] Completare `/src/lib/fattureincloud.ts`:
  - Creazione fattura elettronica
  - Download PDF
  - Invio SDI

- [ ] Aggiungere a webhook Stripe per creare fattura automatica
- [ ] API dashboard per visualizzare/scaricare fatture

### 4. Dashboard - Pagine Aggiuntive
**Priorità: MEDIA**

#### 4.1 Gestione Utenti Admin
- [ ] Pagina `/dashboard/utenti`
- [ ] CRUD utenti con ruoli
- [ ] Solo superadmin può gestire utenti
- [ ] API `/api/dashboard/users`

#### 4.2 Invio Notifiche Push
- [ ] Pagina `/dashboard/notifiche`
- [ ] Form per invio broadcast
- [ ] Selezione target (tutti, piano specifico, custom)
- [ ] Storico notifiche inviate

#### 4.3 Esportazione CSV
- [ ] Endpoint `/api/dashboard/clienti/export`
- [ ] Filtri per esportazione parziale
- [ ] Download diretto

#### 4.4 Impostazioni
- [ ] Pagina `/dashboard/impostazioni`
- [ ] Configurazione email (template, orari invio)
- [ ] Configurazione push (canali, priorità)
- [ ] Configurazione piani pausa

### 5. Accessi Palestra (QR Code)
**Priorità: MEDIA**

- [ ] API `/api/access/validate`
  - Input: token QR o ID cliente
  - Verifica abbonamento attivo
  - Verifica non in pausa
  - Verifica non bannato
  - Crea record in `accessi`
  - Ritorna esito + nome cliente

- [ ] API `/api/access/history`
  - Storico accessi per sede

### 6. Dashboard - Miglioramenti
**Priorità: BASSA**

- [ ] Grafici statistiche (Chart.js o Recharts)
- [ ] Report mensili/settimanali
- [ ] Filtri avanzati clienti (per piano, scadenza, sede)
- [ ] Bulk actions (ban multiplo, invio email multiplo)

### 7. Deploy e Produzione
**Priorità: ALTA**

- [ ] Migrare database su server produzione
- [ ] Configurare variabili ambiente produzione
- [ ] Setup Firebase project e service account
- [ ] Configurare Vercel Cron Jobs
- [ ] Test end-to-end completo
- [ ] Backup database scheduling

---

## Configurazione Cron Jobs (Vercel)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/expiring-subscriptions",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/expiring-push",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/expired-pauses",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

---

## Stima Effort

| Task | Complessità | Tempo Stimato |
|------|-------------|---------------|
| Seed Script | Bassa | 30 min |
| Cron Scadenze | Media | 2 ore |
| Cron Pause | Media | 1 ora |
| Cron Cleanup | Bassa | 30 min |
| Fatture in Cloud | Alta | 3 ore |
| Dashboard Utenti | Media | 2 ore |
| Dashboard Notifiche | Media | 2 ore |
| Export CSV | Bassa | 1 ora |
| Dashboard Impostazioni | Media | 2 ore |
| Accessi QR | Media | 2 ore |
| Deploy/Test | Media | 2 ore |
| **TOTALE** | - | **~18 ore** |

---

## Ordine Consigliato

1. **Seed Script** (necessario per testare)
2. **Cron Jobs** (core business logic)
3. **Accessi QR** (funzionalità chiave per palestra)
4. **Dashboard Utenti** (per delegare gestione)
5. **Fatture in Cloud** (obblighi fiscali)
6. **Export CSV** (utility)
7. **Dashboard Notifiche** (marketing)
8. **Impostazioni** (configurabilità)
9. **Deploy** (go-live)

---

## Note

- I cron jobs richiedono Vercel Pro o un server esterno
- Per Fatture in Cloud servono credenziali API valide
- Firebase richiede progetto configurato con service account
- Consigliato testare in ambiente staging prima del deploy
