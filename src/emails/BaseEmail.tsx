import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BaseEmailProps {
  preview: string;
  children: React.ReactNode;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://24fit.it';

export const BaseEmail = ({ preview, children }: BaseEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Link href={baseUrl}>
              <Img
                src={`${baseUrl}/logo-24fit.png`}
                width="120"
                height="40"
                alt="24FIT"
                style={logo}
              />
            </Link>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              24FIT - La tua palestra, sempre aperta
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
              {' | '}
              <Link href={`${baseUrl}/termini`} style={footerLink}>Termini di Servizio</Link>
            </Text>
            <Text style={footerAddress}>
              Via Example 123, 37069 Villafranca di Verona (VR)
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} 24FIT. Tutti i diritti riservati.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#000000',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
};

const footer = {
  backgroundColor: '#1a1a1a',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '0 0 8px 8px',
};

const footerText = {
  color: '#FFCF02',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const footerLinks = {
  color: '#999999',
  fontSize: '12px',
  margin: '0 0 12px',
};

const footerLink = {
  color: '#999999',
  textDecoration: 'underline',
};

const footerAddress = {
  color: '#666666',
  fontSize: '11px',
  margin: '0 0 8px',
};

const footerCopyright = {
  color: '#666666',
  fontSize: '11px',
  margin: '0',
};

export default BaseEmail;
