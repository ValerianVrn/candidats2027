/** Programme / quiz themes. Order is the display order. */
export const THEMES = {
  energie: 'Énergie',
  ecologie: 'Écologie',
  economie: 'Économie',
  fiscalite: 'Fiscalité',
  travail: 'Travail et salaires',
  retraites: 'Retraites',
  sante: 'Santé',
  education: 'Éducation',
  logement: 'Logement',
  immigration: 'Immigration',
  securite: 'Sécurité et justice',
  institutions: 'Institutions',
  europe: 'Europe',
  defense: 'Défense et international',
  agriculture: 'Agriculture',
  societe: 'Société',
} as const;

export type Theme = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as [Theme, ...Theme[]];
