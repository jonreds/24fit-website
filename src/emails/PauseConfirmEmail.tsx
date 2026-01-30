import {
  Button,
  Heading,
  Hr,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { BaseEmail } from './BaseEmail';

interface PauseConfirmEmailProps {
  nome: string;
  dataInizio: string;
  dataFine: string;
  giorniPausa: number;
  giorniRimanenti: number;
  nuovaScadenzaAbbonamento: string;
  tipo: 'start' | 'end';
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://24fit.it';

export const PauseConfirmEmail = ({
  nome,
  dataInizio,
  dataFine,
  giorniPausa,
  giorniRimanenti,
  nuovaScadenzaAbbonamento,
  tipo,
}: PauseConfirmEmailProps) => {
  const isStart = tipo === 'start';

  return (
    <BaseEmail
      preview={
        isStart
          ? `Pausa abbonamento attivata dal ${dataInizio}`
          : `Pausa abbonamento terminata - Riprendi ad allenarti!`
      }
    >
      <Heading style={heading}>
        {isStart ? 'Pausa Attivata' : 'Bentornato!'}
      </Heading>

      <Text style={paragraph}>
        Ciao <strong>{nome}</strong>,
      </Text>

      {isStart ? (
        <>
          <Text style={paragraph}>
            La tua pausa abbonamento è stata attivata con successo.
            Durante questo periodo non potrai accedere alle palestre 24FIT.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Dettagli Pausa</Text>
            <table style={infoTable}>
              <tbody>
                <tr>
                  <td style={infoLabel}>Data inizio:</td>
                  <td style={infoValue}>{dataInizio}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Data fine:</td>
                  <td style={infoValue}>{dataFine}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Durata pausa:</td>
                  <td style={infoValue}>{giorniPausa} giorni</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Giorni pausa rimanenti:</td>
                  <td style={infoValue}>{giorniRimanenti} giorni</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={highlightBox}>
            <Text style={highlightTitle}>Nuova Scadenza Abbonamento</Text>
            <Text style={highlightValue}>{nuovaScadenzaAbbonamento}</Text>
            <Text style={highlightNote}>
              Il tuo abbonamento è stato esteso automaticamente
            </Text>
          </Section>

          <Text style={paragraph}>
            Puoi terminare la pausa in qualsiasi momento dall'app 24FIT.
            I giorni non utilizzati rimarranno disponibili per future pause.
          </Text>
        </>
      ) : (
        <>
          <Text style={paragraph}>
            La tua pausa è terminata! Puoi riprendere ad allenarti nelle nostre
            palestre 24/7.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>Riepilogo Pausa</Text>
            <table style={infoTable}>
              <tbody>
                <tr>
                  <td style={infoLabel}>Periodo pausa:</td>
                  <td style={infoValue}>{dataInizio} - {dataFine}</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Giorni utilizzati:</td>
                  <td style={infoValue}>{giorniPausa} giorni</td>
                </tr>
                <tr>
                  <td style={infoLabel}>Giorni pausa rimanenti:</td>
                  <td style={infoValue}>{giorniRimanenti} giorni</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Text style={paragraph}>
            Il tuo abbonamento scadrà il <strong>{nuovaScadenzaAbbonamento}</strong>.
          </Text>
        </>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={`${baseUrl}/app`}>
          {isStart ? 'Gestisci Pausa' : 'Riprendi ad Allenarti'}
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={paragraphSmall}>
        Hai domande? Contattaci rispondendo a questa email.
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
  margin: '0 0 16px',
};

const infoTable = {
  width: '100%',
};

const infoLabel = {
  color: '#666666',
  fontSize: '14px',
  padding: '4px 0',
  verticalAlign: 'top' as const,
};

const infoValue = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '500',
  padding: '4px 0',
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const highlightBox = {
  backgroundColor: '#e8f5e9',
  border: '1px solid #a5d6a7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const highlightTitle = {
  color: '#2e7d32',
  fontSize: '13px',
  margin: '0 0 8px',
};

const highlightValue = {
  color: '#1b5e20',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const highlightNote = {
  color: '#2e7d32',
  fontSize: '12px',
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

const signature = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '600',
  margin: '24px 0 0',
};

export default PauseConfirmEmail;
