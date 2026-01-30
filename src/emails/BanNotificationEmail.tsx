import {
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface BanNotificationEmailProps {
  nome: string;
  motivo: string;
  dataInizio: string;
  dataFine?: string | null; // null = permanent
  tipo: 'ban' | 'unban';
}

export const BanNotificationEmail = ({
  nome,
  motivo,
  dataInizio,
  dataFine,
  tipo,
}: BanNotificationEmailProps) => {
  const isPermanent = !dataFine;

  return (
    <BaseEmail
      preview={
        tipo === 'ban'
          ? `Sospensione account 24FIT`
          : `Il tuo account 24FIT è stato riattivato`
      }
    >
      <Heading style={heading}>
        {tipo === 'ban' ? 'Account Sospeso' : 'Account Riattivato'}
      </Heading>

      <Text style={paragraph}>
        Ciao <strong>{nome}</strong>,
      </Text>

      {tipo === 'ban' ? (
        <>
          <Section style={alertBox}>
            <Text style={alertTitle}>
              {isPermanent ? 'Sospensione Permanente' : 'Sospensione Temporanea'}
            </Text>
            <Text style={alertText}>
              Il tuo accesso alle palestre 24FIT è stato sospeso.
            </Text>
          </Section>

          <Section style={infoBox}>
            <Text style={infoTitle}>Dettagli Sospensione</Text>
            <table style={infoTable}>
              <tbody>
                <tr>
                  <td style={infoLabel}>Motivo:</td>
                  <td style={infoValue}>{motivo}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Data inizio:</td>
                  <td style={infoValue}>{dataInizio}</td>
                </tr>
                {!isPermanent && (
                  <tr>
                    <td style={infoLabel}>Data fine:</td>
                    <td style={infoValue}>{dataFine}</td>
                  </tr>
                )}
                <tr>
                  <td style={infoLabel}>Durata:</td>
                  <td style={infoValue}>
                    {isPermanent ? 'Permanente' : `Fino al ${dataFine}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={paragraph}>
            Durante il periodo di sospensione non potrai accedere alle palestre
            24FIT. Il tuo abbonamento è stato messo in pausa automaticamente.
          </Text>

          <Hr style={hr} />

          <Text style={paragraph}>
            Se ritieni che questa sospensione sia un errore o desideri
            presentare un ricorso, contattaci rispondendo a questa email o
            inviando una richiesta a{' '}
            <Link href="mailto:supporto@24fit.it" style={link}>
              supporto@24fit.it
            </Link>
            .
          </Text>
        </>
      ) : (
        <>
          <Section style={successBox}>
            <Text style={successTitle}>Bentornato!</Text>
            <Text style={successText}>
              Il tuo account è stato riattivato con successo.
            </Text>
          </Section>

          <Text style={paragraph}>
            La sospensione del tuo account è stata revocata. Puoi riprendere
            ad accedere alle palestre 24FIT immediatamente.
          </Text>

          {motivo && (
            <Section style={infoBox}>
              <Text style={infoTitle}>Note</Text>
              <Text style={infoValue}>{motivo}</Text>
            </Section>
          )}

          <Text style={paragraph}>
            Ti ricordiamo di rispettare il nostro{' '}
            <Link href="https://24fit.it/codice-etico" style={link}>
              Codice Etico
            </Link>{' '}
            e i{' '}
            <Link href="https://24fit.it/termini" style={link}>
              Termini di Servizio
            </Link>{' '}
            per evitare future sospensioni.
          </Text>
        </>
      )}

      <Hr style={hr} />

      <Text style={paragraphSmall}>
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
  margin: '0 0 24px',
  textAlign: 'center' as const,
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

const alertBox = {
  backgroundColor: '#ffebee',
  border: '1px solid #ef9a9a',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const alertTitle = {
  color: '#c62828',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const alertText = {
  color: '#c62828',
  fontSize: '14px',
  margin: '0',
};

const successBox = {
  backgroundColor: '#e8f5e9',
  border: '1px solid #a5d6a7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const successTitle = {
  color: '#2e7d32',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const successText = {
  color: '#2e7d32',
  fontSize: '14px',
  margin: '0',
};

const infoBox = {
  backgroundColor: '#f8f8f8',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const infoTable = {
  width: '100%',
};

const infoLabel = {
  color: '#666666',
  fontSize: '14px',
  padding: '4px 0',
  verticalAlign: 'top' as const,
  width: '120px',
};

const infoValue = {
  color: '#333333',
  fontSize: '14px',
  padding: '4px 0',
  verticalAlign: 'top' as const,
};

const hr = {
  borderColor: '#e0e0e0',
  margin: '24px 0',
};

const link = {
  color: '#FFCF02',
  textDecoration: 'underline',
};

const signature = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '600',
  margin: '24px 0 0',
};

export default BanNotificationEmail;
