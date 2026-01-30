import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface SubscriptionConfirmEmailProps {
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
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://24fit.it';

export const SubscriptionConfirmEmail = ({
  nome,
  cognome,
  pianoNome,
  prezzo,
  quotaIscrizione,
  prezzoTotale,
  metodoPagamento,
  dataAcquisto,
  dataScadenza,
  numeroOrdine,
}: SubscriptionConfirmEmailProps) => {
  return (
    <BaseEmail preview={`Conferma abbonamento ${pianoNome} - Ordine #${numeroOrdine}`}>
      <Heading style={heading}>
        Abbonamento Confermato!
      </Heading>

      <Section style={successBadge}>
        <Text style={successText}>Pagamento ricevuto</Text>
      </Section>

      <Text style={paragraph}>
        Ciao <strong>{nome} {cognome}</strong>,
      </Text>

      <Text style={paragraph}>
        Il tuo pagamento è stato elaborato con successo. Ecco i dettagli del tuo acquisto:
      </Text>

      <Section style={orderBox}>
        <Text style={orderTitle}>Riepilogo Ordine</Text>
        <Text style={orderNumber}>Ordine #{numeroOrdine}</Text>

        <Hr style={hrLight} />

        <table style={orderTable}>
          <tbody>
            <tr>
              <td style={orderLabel}>Piano:</td>
              <td style={orderValue}>{pianoNome}</td>
            </tr>
            <tr>
              <td style={orderLabel}>Prezzo abbonamento:</td>
              <td style={orderValue}>{prezzo}</td>
            </tr>
            {quotaIscrizione && (
              <tr>
                <td style={orderLabel}>Quota iscrizione:</td>
                <td style={orderValue}>{quotaIscrizione}</td>
              </tr>
            )}
            <tr>
              <td style={orderLabel}>Metodo di pagamento:</td>
              <td style={orderValue}>{metodoPagamento}</td>
            </tr>
            <tr>
              <td style={orderLabel}>Data acquisto:</td>
              <td style={orderValue}>{dataAcquisto}</td>
            </tr>
          </tbody>
        </table>

        <Hr style={hrLight} />

        <table style={orderTable}>
          <tbody>
            <tr>
              <td style={totalLabel}>Totale pagato:</td>
              <td style={totalValue}>{prezzoTotale}</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section style={validityBox}>
        <Text style={validityTitle}>Validità Abbonamento</Text>
        <Text style={validityDate}>
          Scadenza: <strong>{dataScadenza}</strong>
        </Text>
      </Section>

      <Text style={paragraph}>
        Puoi iniziare ad allenarti subito! Accedi alle nostre palestre 24/7 usando
        l'app 24FIT.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/app`}>
          Apri l'App 24FIT
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={paragraphSmall}>
        La fattura sarà disponibile nella sezione "Fatture" dell'app entro 24 ore.
        Per qualsiasi domanda, contattaci rispondendo a questa email.
      </Text>

      <Text style={signature}>
        Il Team 24FIT
      </Text>
    </BaseEmail>
  );
};

// Styles
const heading = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const successBadge = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const successText = {
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  borderRadius: '20px',
  color: '#155724',
  display: 'inline-block',
  fontSize: '13px',
  fontWeight: '600',
  padding: '6px 16px',
  margin: '0',
};

const paragraph = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const paragraphSmall = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px',
};

const orderBox = {
  backgroundColor: '#f8f8f8',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const orderTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const orderNumber = {
  color: '#666666',
  fontSize: '13px',
  margin: '0 0 16px',
};

const orderTable = {
  width: '100%',
};

const orderLabel = {
  color: '#666666',
  fontSize: '14px',
  padding: '4px 0',
  verticalAlign: 'top' as const,
};

const orderValue = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '500',
  padding: '4px 0',
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const totalLabel = {
  color: '#000000',
  fontSize: '15px',
  fontWeight: '600',
  padding: '4px 0',
};

const totalValue = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: '700',
  padding: '4px 0',
  textAlign: 'right' as const,
};

const validityBox = {
  backgroundColor: '#fff8e1',
  border: '1px solid #ffe082',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const validityTitle = {
  color: '#856404',
  fontSize: '13px',
  margin: '0 0 8px',
};

const validityDate = {
  color: '#856404',
  fontSize: '16px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#FFCF02',
  borderRadius: '6px',
  color: '#000000',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
};

const hr = {
  borderColor: '#e0e0e0',
  margin: '24px 0',
};

const hrLight = {
  borderColor: '#e0e0e0',
  margin: '12px 0',
};

const signature = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '600',
  margin: '24px 0 0',
};

export default SubscriptionConfirmEmail;
