import { Resend } from 'resend';
import { render } from '@react-email/components';
import {
  WelcomeEmail,
  PasswordResetEmail,
  SubscriptionConfirmEmail,
  SubscriptionExpiringEmail,
  PauseConfirmEmail,
  BanNotificationEmail,
} from '@/emails';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = '24FIT <noreply@24fit.it>';
const REPLY_TO = 'supporto@24fit.it';

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Welcome Email
export async function sendWelcomeEmail(params: {
  to: string;
  nome: string;
  cognome: string;
  pianoNome: string;
  durataGiorni: number;
  dataScadenza: string;
  giorniPausaInclusi: number;
}): Promise<SendEmailResult> {
  try {
    const html = await render(
      WelcomeEmail({
        nome: params.nome,
        cognome: params.cognome,
        pianoNome: params.pianoNome,
        durataGiorni: params.durataGiorni,
        dataScadenza: params.dataScadenza,
        giorniPausaInclusi: params.giorniPausaInclusi,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject: `Benvenuto in 24FIT, ${params.nome}!`,
      html,
    });

    if (error) {
      console.error('[EMAIL] Welcome email failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Welcome email error:', err);
    return { success: false, error: String(err) };
  }
}

// Password Reset Email
export async function sendPasswordResetEmail(params: {
  to: string;
  nome: string;
  resetUrl: string;
  expiresIn?: string;
  requestedByAdmin?: boolean;
}): Promise<SendEmailResult> {
  try {
    const html = await render(
      PasswordResetEmail({
        nome: params.nome,
        resetUrl: params.resetUrl,
        expiresIn: params.expiresIn || '1 ora',
        requestedByAdmin: params.requestedByAdmin,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject: 'Reset Password - 24FIT',
      html,
    });

    if (error) {
      console.error('[EMAIL] Password reset email failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Password reset email error:', err);
    return { success: false, error: String(err) };
  }
}

// Subscription Confirmation Email
export async function sendSubscriptionConfirmEmail(params: {
  to: string;
  nome: string;
  cognome: string;
  pianoNome: string;
  prezzo: string;
  quotaIscrizione?: string;
  prezzoTotale: string;
  metodoPagamento: string;
  dataAcquisto: string;
  dataScadenza: string;
  numeroOrdine: string;
}): Promise<SendEmailResult> {
  try {
    const html = await render(
      SubscriptionConfirmEmail({
        nome: params.nome,
        cognome: params.cognome,
        pianoNome: params.pianoNome,
        prezzo: params.prezzo,
        quotaIscrizione: params.quotaIscrizione,
        prezzoTotale: params.prezzoTotale,
        metodoPagamento: params.metodoPagamento,
        dataAcquisto: params.dataAcquisto,
        dataScadenza: params.dataScadenza,
        numeroOrdine: params.numeroOrdine,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject: `Conferma Abbonamento ${params.pianoNome} - Ordine #${params.numeroOrdine}`,
      html,
    });

    if (error) {
      console.error('[EMAIL] Subscription confirm email failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Subscription confirm email error:', err);
    return { success: false, error: String(err) };
  }
}

// Subscription Expiring Email
export async function sendSubscriptionExpiringEmail(params: {
  to: string;
  nome: string;
  pianoNome: string;
  dataScadenza: string;
  giorniRimanenti: number;
}): Promise<SendEmailResult> {
  try {
    const html = await render(
      SubscriptionExpiringEmail({
        nome: params.nome,
        pianoNome: params.pianoNome,
        dataScadenza: params.dataScadenza,
        giorniRimanenti: params.giorniRimanenti,
      })
    );

    const subject =
      params.giorniRimanenti <= 3
        ? `Il tuo abbonamento scade tra ${params.giorniRimanenti} giorni!`
        : `Promemoria: il tuo abbonamento scade il ${params.dataScadenza}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL] Subscription expiring email failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Subscription expiring email error:', err);
    return { success: false, error: String(err) };
  }
}

// Pause Confirmation Email
export async function sendPauseConfirmEmail(params: {
  to: string;
  nome: string;
  dataInizio: string;
  dataFine: string;
  giorniPausa: number;
  giorniRimanenti: number;
  nuovaScadenzaAbbonamento: string;
  tipo: 'start' | 'end';
}): Promise<SendEmailResult> {
  try {
    const html = await render(
      PauseConfirmEmail({
        nome: params.nome,
        dataInizio: params.dataInizio,
        dataFine: params.dataFine,
        giorniPausa: params.giorniPausa,
        giorniRimanenti: params.giorniRimanenti,
        nuovaScadenzaAbbonamento: params.nuovaScadenzaAbbonamento,
        tipo: params.tipo,
      })
    );

    const subject =
      params.tipo === 'start'
        ? `Pausa abbonamento attivata - 24FIT`
        : `Bentornato! La tua pausa è terminata - 24FIT`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL] Pause confirm email failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Pause confirm email error:', err);
    return { success: false, error: String(err) };
  }
}

// Ban Notification Email
export async function sendBanNotificationEmail(params: {
  to: string;
  nome: string;
  motivo: string;
  dataInizio: string;
  dataFine?: string | null;
  tipo: 'ban' | 'unban';
}): Promise<SendEmailResult> {
  try {
    const html = await render(
      BanNotificationEmail({
        nome: params.nome,
        motivo: params.motivo,
        dataInizio: params.dataInizio,
        dataFine: params.dataFine,
        tipo: params.tipo,
      })
    );

    const subject =
      params.tipo === 'ban'
        ? `Sospensione Account - 24FIT`
        : `Account Riattivato - 24FIT`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL] Ban notification email failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EMAIL] Ban notification email error:', err);
    return { success: false, error: String(err) };
  }
}

// Utility: Format date for Italian locale
export function formatDateIT(date: Date): string {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Utility: Format currency for Italian locale
export function formatCurrencyIT(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

// Document Approved Notification (for document verification flow)
export async function sendDocumentApprovedNotification(params: {
  to: string;
  nome: string;
  tipoDocumento: string;
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject: 'Documento Verificato - 24FIT',
      html: `
        <h1>Ciao ${params.nome},</h1>
        <p>Il tuo documento (${params.tipoDocumento}) è stato verificato con successo!</p>
        <p>Ora hai pieno accesso a tutte le funzionalità della palestra.</p>
        <p>A presto,<br>Il Team 24FIT</p>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Document Rejected Notification
export async function sendDocumentRejectedNotification(params: {
  to: string;
  nome: string;
  tipoDocumento: string;
  motivo?: string;
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject: 'Documento Non Valido - 24FIT',
      html: `
        <h1>Ciao ${params.nome},</h1>
        <p>Il tuo documento (${params.tipoDocumento}) non è stato approvato.</p>
        ${params.motivo ? `<p><strong>Motivo:</strong> ${params.motivo}</p>` : ''}
        <p>Ti preghiamo di caricare un nuovo documento valido.</p>
        <p>Per assistenza contattaci a supporto@24fit.it</p>
        <p>Il Team 24FIT</p>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// Document Upload Notification (for admin)
export async function sendDocumentUploadNotification(params: {
  to: string;
  clienteNome: string;
  clienteEmail: string;
  tipoDocumento: string;
}): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      replyTo: REPLY_TO,
      subject: `Nuovo Documento Caricato - ${params.clienteNome}`,
      html: `
        <h1>Nuovo documento da verificare</h1>
        <p><strong>Cliente:</strong> ${params.clienteNome} (${params.clienteEmail})</p>
        <p><strong>Tipo documento:</strong> ${params.tipoDocumento}</p>
        <p>Accedi alla dashboard per verificare il documento.</p>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
