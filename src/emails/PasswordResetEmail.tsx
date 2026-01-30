import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface PasswordResetEmailProps {
  nome: string;
  resetUrl: string;
  expiresIn: string;
  requestedByAdmin?: boolean;
}

export const PasswordResetEmail = ({
  nome,
  resetUrl,
  expiresIn = '1 ora',
  requestedByAdmin = false,
}: PasswordResetEmailProps) => {
  return (
    <BaseEmail preview={`Reset password richiesto per il tuo account 24FIT`}>
      <Heading style={heading}>
        Reset Password
      </Heading>

      <Text style={paragraph}>
        Ciao <strong>{nome}</strong>,
      </Text>

      {requestedByAdmin ? (
        <Text style={paragraph}>
          Un amministratore ha richiesto il reset della tua password. Se non hai
          richiesto questa operazione, puoi ignorare questa email in sicurezza.
        </Text>
      ) : (
        <Text style={paragraph}>
          Hai richiesto il reset della tua password. Se non sei stato tu a fare
          questa richiesta, puoi ignorare questa email in sicurezza.
        </Text>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Reimposta Password
        </Button>
      </Section>

      <Section style={warningBox}>
        <Text style={warningText}>
          Questo link scade tra <strong>{expiresIn}</strong>.
        </Text>
        <Text style={warningText}>
          Non condividere questo link con nessuno.
        </Text>
      </Section>

      <Hr style={hr} />

      <Text style={paragraphSmall}>
        Se il pulsante non funziona, copia e incolla questo link nel browser:
      </Text>
      <Text style={urlText}>
        {resetUrl}
      </Text>

      <Hr style={hr} />

      <Text style={paragraphSmall}>
        Se non hai richiesto il reset della password, il tuo account potrebbe essere
        a rischio. Ti consigliamo di contattarci immediatamente.
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

const warningBox = {
  backgroundColor: '#fff8e1',
  border: '1px solid #ffe082',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#856404',
  fontSize: '13px',
  margin: '0 0 4px',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e0e0e0',
  margin: '24px 0',
};

const urlText = {
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  color: '#666666',
  fontSize: '12px',
  padding: '12px',
  wordBreak: 'break-all' as const,
};

const signature = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '600',
  margin: '24px 0 0',
};

export default PasswordResetEmail;
