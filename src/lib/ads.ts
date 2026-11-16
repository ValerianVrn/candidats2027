/**
 * AdSense configuration. Ads are disabled unless PUBLIC_ADSENSE_CLIENT (ca-pub-…) is set at build time.
 * Consent is collected by Google's certified CMP (« Privacy & messaging »), configured in the AdSense account.
 */
export const ADSENSE_CLIENT: string | null = (() => {
  const v = import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined;
  return v && /^ca-pub-\d{10,20}$/.test(v) ? v : null;
})();

/** Ad unit ids per placement (set at build time once created in AdSense). */
export const AD_SLOTS = {
  home: (import.meta.env.PUBLIC_ADSENSE_SLOT_HOME as string | undefined) ?? null,
  journal: (import.meta.env.PUBLIC_ADSENSE_SLOT_JOURNAL as string | undefined) ?? null,
} as const;
