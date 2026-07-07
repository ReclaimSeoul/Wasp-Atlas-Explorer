import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('availableSets', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads, validates, and normalizes sets from atlas catalog + meta', async () => {
    const createAggregationFromData = vi.fn((data: any) => {
      if (data?.invalid) {
        throw new Error('Invalid aggregation payload');
      }
      if (data?.global_constraints?.length) {
        throw new Error('Unsupported global constraints');
      }
      return {};
    });
    vi.doMock('webwaspjs', () => ({ createAggregationFromData }));

    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/catalog/catalog.json')) {
        return {
          ok: true,
          json: async () => ({
            systems: [
              {
                slug: 'z-set',
                name: 'Zeta Set',
                description: 'Z desc',
                author: 'Author Z',
                tags: ['tag-z'],
                aggregation_url: 'systems/z-set/aggregation.json',
                meta_url: 'systems/z-set/meta.json',
              },
              {
                slug: 'a-set',
                name: 'Alpha Set',
                description: 'A desc',
                author: 'Author A',
                tags: ['tag-a'],
                aggregation_url: 'systems/a-set/aggregation.json',
                meta_url: 'systems/a-set/meta.json',
              },
              {
                slug: 'bottles-system',
                name: 'bottles-system',
                description: {
                  short: 'A system for reusing bottles with different sizes',
                  long: '',
                },
                tags: [],
                license: {
                  value: 'CC-BY-4.0',
                },
                author: '',
                thumbnail: 'systems/bottles-system/00_thumb.png',
                aggregation_url: 'systems/bottles-system/aggregation.json',
                meta_url: 'systems/bottles-system/meta.json',
              },
              {
                slug: 'broken-set',
                name: 'Broken Set',
                description: 'Broken desc',
                author: 'Broken Author',
                tags: ['tag-broken'],
                aggregation_url: 'systems/broken-set/aggregation.json',
                meta_url: 'systems/broken-set/meta.json',
              },
            ],
          }),
        };
      }

      if (url.endsWith('/systems/a-set/meta.json')) {
        return {
          ok: true,
          json: async () => ({
            units: 'mm',
            version: '1.0.0',
            created: '2026-03-02',
            colors: ['#ffffff'],
            byPart: { A: '#ffffff' },
          }),
        };
      }

      if (url.endsWith('/systems/z-set/meta.json')) {
        return {
          ok: true,
          json: async () => ({
            units: 'cm',
            version: '2.0.0',
            created: '2026-03-03',
            palette: ['#000000'],
            by_part: { Z: '#000000' },
          }),
        };
      }

      if (url.endsWith('/systems/broken-set/meta.json')) {
        return {
          ok: true,
          json: async () => ({
            units: 'm',
          }),
        };
      }

      if (url.endsWith('/systems/bottles-system/meta.json')) {
        return {
          ok: true,
          json: async () => ({
            title: 'Multi-Bottle System',
            authors: [
              {
                name: 'Andrea Rossi',
                affiliation: 'Reclaim Seoul',
              },
            ],
            license: {
              value: 'CC-BY-4.0',
            },
            description: {
              short: 'A system for reusing bottles with different sizes',
              long: '',
            },
            tags: [],
            units: '',
            metrics: {
              parts_total: 2,
              rules_total: 9,
            },
            files: {
              aggregation: 'bottles-system/aggregation.json',
              meta: 'bottles-system/meta.json',
              thumbnail: 'bottles-system/00_thumb.png',
            },
          }),
        };
      }

      if (url.endsWith('/systems/a-set/aggregation.json')) {
        return {
          ok: true,
          json: async () => ({
            name: 'Alpha aggregation',
            global_constraints: [{ type: 'MeshConstraint' }],
          }),
        };
      }

      if (url.endsWith('/systems/z-set/aggregation.json')) {
        return {
          ok: true,
          json: async () => ({ name: 'Zeta aggregation' }),
        };
      }

      if (url.endsWith('/systems/broken-set/aggregation.json')) {
        return {
          ok: true,
          json: async () => ({ invalid: true }),
        };
      }

      if (url.endsWith('/systems/bottles-system/aggregation.json')) {
        return {
          ok: true,
          json: async () => ({ name: 'Bottles aggregation' }),
        };
      }

      return { ok: false, json: async () => ({}) };
    });

    vi.stubGlobal('fetch', fetchMock);

    const mod = await import('./availableSets');
    const result = await mod.loadAvailableSets();

    expect(result.fromBackup).toBe(false);
    expect(result.notice).toBeNull();
    expect(result.sets.length).toBe(3);

    const names = result.sets.map((set) => set.name);
    expect(names).toEqual(['Alpha Set', 'Multi-Bottle System', 'Zeta Set']);

    for (const set of result.sets) {
      expect(set.slug).toBeTruthy();
      expect(set.name).toBeTruthy();
      expect(set.path).toContain('https://raw.githubusercontent.com/ReclaimSeoul/Reclaimed-Design-Systems/main/systems/');
      expect(set.aggregation).toBe('aggregation.json');
      expect(Array.isArray(set.colors)).toBe(true);
      expect(typeof set.byPart).toBe('object');
      expect(Array.isArray(set.tags)).toBe(true);
    }

    const bottlesSet = result.sets.find((set) => set.slug === 'bottles-system');
    expect(bottlesSet).toMatchObject({
      name: 'Multi-Bottle System',
      description: 'A system for reusing bottles with different sizes',
      author: 'Andrea Rossi',
      license: 'CC-BY-4.0',
      thumbnail: 'https://raw.githubusercontent.com/ReclaimSeoul/Reclaimed-Design-Systems/main/systems/bottles-system/00_thumb.png',
    });

    expect(createAggregationFromData).toHaveBeenCalledTimes(4);
    const alphaValidationPayload = createAggregationFromData.mock.calls
      .map((call) => call[0])
      .find((payload) => payload.name === 'Alpha aggregation');
    expect(alphaValidationPayload.global_constraints).toEqual([]);
    expect(infoSpy).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('Dataset failed: broken-set');
  });
});
