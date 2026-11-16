/**
 * Publisher details for the legal notice (LCEN art. 6 III). Required by law before going live:
 * the owner fills these in before the first release. `null` renders a visible « [à compléter] ».
 */
export const PUBLISHER = {
  /** Company name or « Prénom Nom (entrepreneur individuel) ». */
  name: null as string | null,
  legalForm: null as string | null,
  siret: null as string | null,
  address: null as string | null,
  /** Directeur ou directrice de la publication. */
  director: null as string | null,
  /** Contact address for readers, rights of reply and data requests. */
  email: null as string | null,
};

export const HOST = {
  name: 'Microsoft Ireland Operations Limited (Microsoft Azure)',
  address: 'One Microsoft Place, South County Business Park, Leopardstown, Dublin 18, D18 P521, Irlande',
  region: "Europe de l'Ouest (Pays-Bas)",
};

export const TODO = '[à compléter]';

/** True when every legally required field is filled. A test blocks releases otherwise (see legal.test.ts). */
export const publisherComplete = Object.values(PUBLISHER).every(
  (v) => typeof v === 'string' && v.trim() !== '',
);
