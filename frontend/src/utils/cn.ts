import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizePhoneValue = (value: string) =>
  value.replace(/\D/g, '').slice(0, 10);

export const normalizeOtpValue = (value: string) =>
  value.replace(/\D/g, '').slice(0, 6);

export const normalizePincodeValue = (value: string) =>
  value.replace(/\D/g, '').slice(0, 6);
