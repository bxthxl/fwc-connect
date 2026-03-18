import { z } from 'zod';

// Password validation
export const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /\d/.test(p) },
  { label: 'One special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors = passwordRequirements
    .filter(req => !req.test(password))
    .map(req => req.label);
  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password: string): 'weak' | 'fair' | 'good' | 'strong' {
  const passed = passwordRequirements.filter(req => req.test(password)).length;
  if (passed <= 2) return 'weak';
  if (passed <= 3) return 'fair';
  if (passed <= 4) return 'good';
  return 'strong';
}

// Nigerian phone number validation
// Accepts: +234XXXXXXXXXX, 234XXXXXXXXXX, 0XXXXXXXXXX
const nigerianPhoneRegex = /^(?:\+?234|0)[789]\d{9}$/;

export function validateNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  return nigerianPhoneRegex.test(cleaned);
}

export function formatPhoneHint(): string {
  return 'Format: +234 XXX XXX XXXX or 0XXX XXX XXXX';
}

// Zod schemas for reuse
export const nigerianPhoneSchema = z
  .string()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true; // allow empty
      return validateNigerianPhone(val);
    },
    { message: 'Please enter a valid Nigerian phone number (e.g. +2348012345678 or 08012345678)' }
  );

export const requiredNigerianPhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    (val) => validateNigerianPhone(val),
    { message: 'Please enter a valid Nigerian phone number (e.g. +2348012345678 or 08012345678)' }
  );
