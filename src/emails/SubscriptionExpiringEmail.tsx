import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface SubscriptionExpiringEmailProps {
  nome: string;
  pianoNome: string;
  dataScadenza: string;
  giorniRimanenti: number;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://24fit.it';

export const SubscriptionExpiringEmail = ({
  nome,
  pianoNome,
  dataScadenza,
  giorniRimanenti,
}: SubscriptionExpiringEmailProps) => {
  const urgency = giorniRimanenti <= 3 ? 'urgent' : giorniRimanenti <= 7 ? 'warning' : 'normal';

  return (
    <BaseEmail preview={`Il tuo abbonamento ${pianoNome} scade tra ${giorniRimanenti} giorni`}>
      <Heading style={heading}>
        {giorniRimanenti <= 3
          ? 'Il tuo abbonamento sta per scadere!'
          : 'Promemoria Scadenza Abbonamento'}
      </Heading>

      <Text style={paragraph}>
        Ciao <strong>{nome}</strong>,
      </Text>

      <Section style={urgency === 'urgent' ? alertBoxUrgent : urgency === 'warning' ? alertBoxWarning : alertBoxNormal}>
        <Text style={alertNumber}>{giorniRimanenti}</Text>
        <Text style={alertText}>
          {giorniRimanenti === 1 ? 'giorno rimanente' : 'giorni rimanenti'}
        </Text>
      </Section>

      <Text style={paragraph}>
        Il tuo abbonamento <strong>{pianoNome}</strong> scadrà il{' '}
        <strong>{dataScadenza}</strong>.
      </Text>

      {giorniRimanenti <= 3 && (
        <Text style={paragraphHighlight}>
          Dopo la scadenza non potrai più accedere alle palestre 24FIT.
          Rinnova ora per continuare ad allenarti senza interruzioni!
        </Text>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/abbonamenti`}>
          Rinnova Abbonamento
        </Button>
      </Section>

      <Hr style={hr} />

      <Section style={benefitsBox}>
        <Text style={benefitsTitle}>Perché rinnovare con 24FIT?</Text>
        <Text style={benefitItem}>Accesso 24/7 a tutte le sedi</Text>
        <Text style={benefitItem}>Nessun vincolo di orario</Text>
        <Text style={benefitItem}>Pause incluse nel tuo piano</Text>
        <Text style={benefitItem}>Zero code, zero attese</Text>
      </Section>

      <Hr style={hr} />

      <Text style={paragraphSmall}>
        Hai domande sul rinnovo? Contattaci rispondendo a questa email o
        tramite l'app.
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

const paragraphHighlight = {
  color: '#d32f2f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
  fontWeight: '500',
};

const paragraphSmall = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px',
};

const alertBoxNormal = {
  backgroundColor: '#e3f2fd',
  border: '1px solid #90caf9',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const alertBoxWarning = {
  backgroundColor: '#fff8e1',
  border: '1px solid #ffe082',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const alertBoxUrgent = {
  backgroundColor: '#ffebee',
  border: '1px solid #ef9a9a',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const alertNumber = {
  fontSize: '48px',
  fontWeight: '700',
  color: '#000000',
  margin: '0',
  lineHeight: '1',
};

const alertText = {
  fontSize: '14px',
  color: '#666666',
  margin: '8px 0 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#FFCF02',
  borderRadius: '6px',
  color: '#000000',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
};

const benefitsBox = {
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const benefitsTitle = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const benefitItem = {
  color: '#333333',
  fontSize: '13px',
  margin: '0 0 6px',
  paddingLeft: '16px',
  position: 'relative' as const,
};

const hr = {
  borderColor: '#e0e0e0',
  margin: '24px 0',
};

const signature = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '600',
  margin: '24px 0 0',
};

export default SubscriptionExpiringEmail;
