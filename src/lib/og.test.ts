import { describe, expect, it } from 'vitest';
import { candidateCardSvg, escapeXml, homeCardSvg, nameLines } from './og';

describe('nameLines', () => {
  it('keeps short names on one line and splits long ones on a word', () => {
    expect(nameLines('Marine Le Pen')).toEqual(['Marine Le Pen']);
    expect(nameLines('Nicolas Dupont-Aignan')).toEqual(['Nicolas', 'Dupont-Aignan']);
    expect(nameLines('Jean-François Legendre')).toEqual(['Jean-François', 'Legendre']);
  });
});

const base = {
  name: 'Anne Durand',
  party: 'Parti <Exemple> & Co',
  famille: 'centre' as const,
  status: 'Déclarée',
  statusKind: 'declare' as const,
  initials: 'AD',
};

describe('candidateCardSvg', () => {
  it('escapes text and uses the family colour', () => {
    const svg = candidateCardSvg({ ...base, portrait: null });
    expect(svg).toContain('Parti &lt;Exemple&gt; &amp; Co');
    expect(svg).toContain('#f5c04a');
    expect(svg).toContain('>AD<');
  });

  it('embeds the portrait when there is one', () => {
    const svg = candidateCardSvg({ ...base, portrait: 'data:image/png;base64,AAAA' });
    expect(svg).toContain('href="data:image/png;base64,AAAA"');
    expect(svg).not.toContain('>AD<');
  });

  it('shows potential candidates with a grey badge, as on the site', () => {
    const svg = candidateCardSvg({ ...base, status: 'Potentielle', statusKind: 'potentiel', portrait: null });
    expect(svg).toContain('#222b4f');
    expect(svg).not.toContain('#6fe3a5');
  });
});

describe('homeCardSvg', () => {
  it('shows the counts and the first round date', () => {
    const svg = homeCardSvg(36, 8, '18 avril 2027');
    expect(svg).toContain('36 candidats déclarés');
    expect(svg).toContain('18 avril 2027');
  });
});

describe('escapeXml', () => {
  it('escapes quotes too', () => {
    expect(escapeXml('a"b')).toBe('a&quot;b');
  });
});
