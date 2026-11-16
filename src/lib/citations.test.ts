import { describe, expect, it } from 'vitest';
import { CitationRegistry } from './citations';

const src = (url: string) => ({ url, outlet: 'AFP', date: '2026-11-16' });

describe('CitationRegistry', () => {
  it('numbers sources by first appearance and reuses numbers for the same URL', () => {
    const reg = new CitationRegistry();
    expect(reg.cite([src('https://a.fr/1'), src('https://b.fr/2')])).toEqual([1, 2]);
    expect(reg.cite([src('https://b.fr/2'), src('https://c.fr/3')])).toEqual([2, 3]);
    expect(reg.list.map((s) => s.url)).toEqual(['https://a.fr/1', 'https://b.fr/2', 'https://c.fr/3']);
  });
});
