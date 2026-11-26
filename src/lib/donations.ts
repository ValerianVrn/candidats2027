/**
 * Voluntary contributions (ADR 0006). The Stripe Payment Link comes from PUBLIC_DONATION_URL at build time;
 * without a valid one, nothing about contributions is shown anywhere.
 */

/** Only Stripe-hosted payment pages are accepted (the site never handles payment data). */
export function donationUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname;
    const stripe = host === 'buy.stripe.com' || host === 'donate.stripe.com';
    return url.protocol === 'https:' && stripe ? url.href : null;
  } catch {
    return null;
  }
}

export const DONATION_URL = donationUrl(import.meta.env.PUBLIC_DONATION_URL as string | undefined);

/** Rules shown wherever contributions are offered. */
export const DONATION_RULES = {
  /** Amount suggested on the Stripe page; the donor chooses between minimum and maximum (one-off only). */
  suggested: 5,
  minimum: 2,
  maximum: 100,
  monthlyCapPerPerson: 100,
  refundDays: 30,
} as const;
