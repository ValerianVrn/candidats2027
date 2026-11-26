/**
 * Audience measurement: Cloudflare Web Analytics (cookie-free, no IP kept; see the privacy policy).
 * The token comes from PUBLIC_CF_ANALYTICS_TOKEN at build time, production only; without a valid one nothing loads.
 */
export function cfToken(value: string | undefined): string | null {
  return value && /^[0-9a-f]{32}$/.test(value) ? value : null;
}

export const CF_ANALYTICS_TOKEN = cfToken(import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN as string | undefined);
