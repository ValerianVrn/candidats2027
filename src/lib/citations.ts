import type { Source } from './schemas';

/**
 * Numbers sources in order of first appearance, so every fact can show « [1] », « [2] »…
 * and the same URL always gets the same number within one candidate.
 */
export class CitationRegistry {
  private readonly byUrl = new Map<string, number>();
  readonly list: Source[] = [];

  /** Registers the sources (if new) and returns their numbers. */
  cite(sources: readonly Source[]): number[] {
    return sources.map((s) => {
      const existing = this.byUrl.get(s.url);
      if (existing !== undefined) return existing;
      this.list.push(s);
      const n = this.list.length;
      this.byUrl.set(s.url, n);
      return n;
    });
  }
}
