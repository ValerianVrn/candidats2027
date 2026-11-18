import { describe, expect, it } from 'vitest';
import { homeDebate } from './events';
import type { CampaignEvent } from './schemas';

const ev = (id: string, date: string, kind: 'debat' | 'emission' = 'debat'): CampaignEvent => ({
  id,
  kind,
  date,
  time: null,
  title: id,
  channels: ['TF1'],
  summary: 's',
  participants: ['a'],
  absents: [],
  replayUrl: null,
  sources: [],
});

describe('homeDebate', () => {
  const list = [ev('old', '2026-10-01'), ev('last', '2026-11-16'), ev('show', '2026-11-20', 'emission')];

  it('features the most recent debate within three weeks', () => {
    expect(homeDebate(list, '2026-11-18')).toEqual({ event: list[1], upcoming: false });
  });

  it('prefers the next announced debate, today included', () => {
    const next = ev('next', '2026-11-25');
    expect(homeDebate([...list, next], '2026-11-18')).toEqual({ event: next, upcoming: true });
    expect(homeDebate([...list, ev('today', '2026-11-18')], '2026-11-18')?.event.id).toBe('today');
  });

  it('ignores broadcasts that are not debates, and old debates', () => {
    expect(homeDebate(list, '2026-12-20')).toBeNull();
  });
});
