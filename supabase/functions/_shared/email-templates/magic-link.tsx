/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link for FWC Worship Team</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://ipbbhsjahjxnkzqxmqmd.supabase.co/storage/v1/object/public/email-assets/fwc-logo.png" width="64" height="64" alt="FWC Worship Team" style={logo} />
        <Heading style={h1}>Your Login Link</Heading>
        <Text style={text}>
          Click the button below to log in to FWC Worship Team. This link will expire shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Log In
        </Button>
        <Text style={footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '480px', margin: '0 auto' }
const logo = { margin: '0 0 20px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#4a2578', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#665580', lineHeight: '1.6', margin: '0 0 25px' }
const button = { backgroundColor: '#4a2578', color: '#ffffff', fontSize: '15px', borderRadius: '10px', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold' as const }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
