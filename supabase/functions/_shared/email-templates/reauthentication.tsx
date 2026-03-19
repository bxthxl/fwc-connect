/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your FWC Worship Team verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://ipbbhsjahjxnkzqxmqmd.supabase.co/storage/v1/object/public/email-assets/fwc-logo.png" width="64" height="64" alt="FWC Worship Team" style={logo} />
        <Heading style={h1}>Verification Code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '480px', margin: '0 auto' }
const logo = { margin: '0 0 20px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#4a2578', margin: '0 0 20px' }
const text = { fontSize: '15px', color: '#665580', lineHeight: '1.6', margin: '0 0 25px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#4a2578', margin: '0 0 30px', letterSpacing: '4px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
