import { describe, expect, it } from 'vitest';
import { PUBLISHER, publisherComplete } from './publisher';

describe('legal notice', () => {
  // The LCEN requires the publisher's identity before the site goes live. This test only runs on the
  // release path (RELEASE=1, set by the prod deploy workflow), so development is not blocked meanwhile.
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  it.runIf(env.RELEASE === '1')('has every publisher field filled in before a release', () => {
    expect(PUBLISHER).toBeDefined();
    expect(publisherComplete).toBe(true);
  });
});
