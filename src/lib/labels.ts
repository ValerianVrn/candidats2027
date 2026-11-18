import type { Candidate, Famille, Status } from './schemas';

export const FAMILLE_LABEL: Record<Famille, string> = {
  'extreme-gauche': 'Extrême gauche',
  gauche: 'Gauche',
  centre: 'Centre',
  droite: 'Droite',
  'extreme-droite': 'Extrême droite',
  divers: 'Sans étiquette',
};

const STATUS_WORD: Record<Status, string> = {
  potentiel: 'potentiel',
  declare: 'déclaré',
  officiel: 'officiel',
  retire: 'retiré',
};

/** « Déclarée », « Potentiel »… agreed with the candidate's grammatical gender. */
export function statusLabel(c: Pick<Candidate, 'status' | 'genre'>): string {
  const w = STATUS_WORD[c.status];
  const agreed = c.genre === 'f' ? (w.endsWith('el') ? `${w}le` : `${w}e`) : w;
  return agreed.charAt(0).toUpperCase() + agreed.slice(1);
}

/** Plural filter labels. */
export const STATUS_PLURAL: Record<Status, string> = {
  potentiel: 'Potentiels',
  declare: 'Déclarés',
  officiel: 'Officiels',
  retire: 'Retirés',
};

/** Active legal or tax procedure: drives the « ! » badge and the « Avec procédure » filter. */
export function hasActiveProcedure(c: Pick<Candidate, 'risques'>): boolean {
  return c.risques.some((r) => r.nature !== 'politique' && r.active);
}
