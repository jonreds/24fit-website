import {
  Button,
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface WelcomeEmailProps {
  nome: string;
  cognome: string;
  pianoNome: string;
  durataGiorni: number;
  dataScadenza: string;
  giorniPausaInclusi: number;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://24fit.it';

export const WelcomeEmail = ({
  nome,
  cognome,
  pianoNome,
  durataGiorni,
  dataScadenza,
  giorniPausaInclusi,
}: WelcomeEmailProps) => {
  return (
    <BaseEmail preview={`Benvenuto in 24FIT, ${nome}! Il tuo abbonamento è attivo.`}>
      <Heading style={heading}>
        Benvenuto in 24FIT!
      </Heading>

      <Text style={paragraph}>
        Ciao <strong>{nome} {cognome}</strong>,
      </Text>

      <Text style={paragraph}>
        Grazie per aver scelto 24FIT! Il tuo abbonamento è ora attivo e puoi accedere
        alle nostre palestre 24 ore su 24, 7 giorni su 7.
      </Text>

      <Section style={infoBox}>
        <Text style={infoTitle}>Il tuo abbonamento</Text>
        <Text style={infoItem}>
          <strong>Piano:</strong> {pianoNome}
        </Text>
        <Text style={infoItem}>
          <strong>Durata:</strong> {durataGiorni} giorni
        </Text>
        <Text style={infoItem}>
          <strong>Scadenza:</strong> {dataScadenza}
        </Text>
        <Text style={infoItem}>
          <strong>Giorni pausa inclusi:</strong> {giorniPausaInclusi}
        </Text>
      </Section>

      <Text style={paragraph}>
        Scarica la nostra app per gestire il tuo abbonamento, mettere in pausa
        quando necessario e accedere alle palestre con il QR code.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href="https://apps.apple.com/app/24fit">
          Scarica per iOS
        </Button>
        <Button style={buttonSecondary} href="https://play.google.com/store/apps/details?id=it.24fit.app">
          Scarica per Android
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={paragraph}>
        <strong>Come accedere alla palestra:</strong>
      </Text>
      <Text style={listItem}>1. Apri l'app 24FIT</Text>
      <Text style={listItem}>2. Vai alla sezione "Accesso"</Text>
      <Text style={listItem}>3. Mostra il QR code al lettore all'ingresso</Text>

      <Hr style={hr} />

      <Text style={paragraphSmall}>
        Hai domande? Rispondi a questa email o contattaci su{' '}
        <Link href="https://wa.me/393401234567" style={link}>WhatsApp</Link>.
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

const infoBox = {
  backgroundColor: '#f8f8f8',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const infoItem = {
  color: '#333333',
  fontSize: '14px',
  margin: '0 0 8px',
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
  marginRight: '8px',
  marginBottom: '8px',
};

const buttonSecondary = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  marginBottom: '8px',
};

const hr = {
  borderColor: '#e0e0e0',
  margin: '24px 0',
};

const listItem = {
  color: '#333333',
  fontSize: '14px',
  margin: '0 0 8px',
  paddingLeft: '8px',
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

export default WelcomeEmail;
