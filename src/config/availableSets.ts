import { createAggregationFromData } from 'webwaspjs';

const DEFAULT_ATLAS_RAW_BASE = 'https://raw.githubusercontent.com/ReclaimSeoul/Reclaimed-Design-Systems/main/';
const ATLAS_RAW_BASE = (import.meta.env.VITE_ATLAS_RAW_BASE || DEFAULT_ATLAS_RAW_BASE).replace(/\/?$/, '/');
const ATLAS_CATALOG_URL = `${ATLAS_RAW_BASE}catalog/catalog.json`;

export const CUSTOM_UPLOAD_SLUG = '__custom_upload__';

export type DemoSetConfig = {
  slug: string;
  name: string;
  description: string;
  author: string;
  path: string;
  aggregation: string;
  colors: string[];
  byPart: Record<string, string>;
  meta?: string;
  tags?: string[];
  license?: string;
  units?: string;
  version?: string;
  created?: string;
  thumbnail?: string;
};

type CatalogLoadResult = {
  sets: DemoSetConfig[];
  fromBackup: boolean;
  notice: string | null;
};

type AtlasSystem = {
  slug?: string;
  name?: string;
  title?: string;
  description?: string | { short?: string; long?: string };
  author?: string;
  authors?: Array<{ name?: string; affiliation?: string } | string>;
  tags?: string[];
  license?: string | { value?: string; name?: string };
  thumbnail?: string;
  aggregation_url?: string;
  meta_url?: string;
  files?: {
    aggregation?: string;
    meta?: string;
    thumbnail?: string;
  };
};

type AtlasCatalog = {
  systems?: AtlasSystem[];
};

type AtlasMeta = {
  title?: string;
  description?: string | { short?: string; long?: string };
  author?: string;
  authors?: Array<{ name?: string; affiliation?: string } | string>;
  tags?: string[];
  license?: string | { value?: string; name?: string };
  units?: string;
  version?: string;
  created?: string;
  thumbnail?: string;
  files?: {
    thumbnail?: string;
  };
  colors?: string[];
  palette?: string[];
  byPart?: Record<string, string>;
  by_part?: Record<string, string>;
};

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDescription(value: AtlasSystem['description'] | AtlasMeta['description']): string {
  if (typeof value === 'string') return value.trim();
  return normalizeText(value?.short) || normalizeText(value?.long);
}

function normalizeLicense(value: AtlasSystem['license'] | AtlasMeta['license']): string {
  if (typeof value === 'string') return value.trim();
  return normalizeText(value?.value) || normalizeText(value?.name);
}

function normalizeAuthors(value: AtlasSystem['authors'] | AtlasMeta['authors'], fallback?: string): string {
  const fallbackText = normalizeText(fallback);
  if (!Array.isArray(value)) return fallbackText;

  const names = value
    .map((author) => (typeof author === 'string' ? author.trim() : normalizeText(author?.name)))
    .filter(Boolean);
  return names.length ? names.join(', ') : fallbackText;
}

async function loadAtlasMeta(metaUrl?: string): Promise<AtlasMeta | null> {
  if (!metaUrl) return null;
  try {
    const response = await fetch(metaUrl, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as AtlasMeta;
  } catch {
    return null;
  }
}

async function toAtlasSet(system: AtlasSystem): Promise<DemoSetConfig | null> {
  const relAggregation = normalizeText(system.aggregation_url) || normalizeText(system.files?.aggregation);
  if (!relAggregation) return null;

  const slash = relAggregation.lastIndexOf('/');
  const aggregation = slash >= 0 ? relAggregation.slice(slash + 1) : relAggregation;
  const basePath = slash >= 0 ? relAggregation.slice(0, slash + 1) : '';
  const displayName = normalizeText(system.title) || normalizeText(system.name);
  const slug = normalizeText(system.slug) || displayName.toLowerCase().replace(/\s+/g, '-');
  if (!slug || !aggregation) return null;

  const relMeta = normalizeText(system.meta_url) || normalizeText(system.files?.meta);
  const metaUrl = relMeta ? `${ATLAS_RAW_BASE}${relMeta}` : undefined;
  const meta = await loadAtlasMeta(metaUrl);

  const tags = Array.isArray(meta?.tags) && meta.tags.length
    ? meta.tags
    : Array.isArray(system.tags)
      ? system.tags
      : [];
  const license = normalizeLicense(meta?.license) || normalizeLicense(system.license);
  const units = normalizeText(meta?.units);
  const version = normalizeText(meta?.version);
  const created = normalizeText(meta?.created);
  const catalogThumb = normalizeText(system.thumbnail) || normalizeText(system.files?.thumbnail);
  const metaThumb = normalizeText(meta?.thumbnail) || normalizeText(meta?.files?.thumbnail);
  const thumbnail = catalogThumb
    ? `${ATLAS_RAW_BASE}${catalogThumb}`
    : metaThumb
      ? `${ATLAS_RAW_BASE}${basePath}${metaThumb}`
      : '';
  const colors = Array.isArray(meta?.colors) ? meta.colors : Array.isArray(meta?.palette) ? meta.palette : [];
  const byPart = meta?.byPart || meta?.by_part || {};

  return {
    slug,
    name: normalizeText(meta?.title) || displayName || slug,
    description: normalizeDescription(meta?.description) || normalizeDescription(system.description),
    author: normalizeAuthors(meta?.authors, meta?.author) || normalizeAuthors(system.authors, system.author),
    path: `${ATLAS_RAW_BASE}${basePath}`,
    aggregation,
    colors,
    byPart,
    meta: metaUrl,
    tags,
    license,
    units,
    version,
    created,
    thumbnail,
  };
}

function logDatasetLoadResult(set: DemoSetConfig, success: boolean, reason?: string) {
  const prefix = `[Reclaimed Design Systems] Dataset ${success ? 'loaded' : 'failed'}: ${set.slug}`;
  if (success) {
    console.info(prefix, { name: set.name, path: `${set.path}${set.aggregation}` });
  } else {
    console.warn(prefix, { name: set.name, path: `${set.path}${set.aggregation}`, reason });
  }
}

async function validateAtlasSet(set: DemoSetConfig): Promise<boolean> {
  try {
    const response = await fetch(`${set.path}${set.aggregation}`, { cache: 'no-store' });
    if (!response.ok) {
      logDatasetLoadResult(set, false, `HTTP ${response.status}`);
      return false;
    }

    const data = await response.json();
    createAggregationFromData(data);
    logDatasetLoadResult(set, true);
    return true;
  } catch (error: any) {
    logDatasetLoadResult(set, false, error?.message || 'Unknown validation error');
    return false;
  }
}

let catalogLoadPromise: Promise<CatalogLoadResult> | null = null;

async function fetchRemoteSets(): Promise<DemoSetConfig[]> {
  const response = await fetch(ATLAS_CATALOG_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load atlas catalog: ${response.status}`);
  }
  const data = (await response.json()) as AtlasCatalog;
  const systems = Array.isArray(data.systems) ? data.systems : [];
  const mapped = (await Promise.all(systems.map((system) => toAtlasSet(system)))).filter(
    (item): item is DemoSetConfig => Boolean(item),
  );
  const validated = await Promise.all(
    mapped.map(async (set) => ((await validateAtlasSet(set)) ? set : null)),
  );
  return validated
    .filter((item): item is DemoSetConfig => Boolean(item))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadAvailableSets(): Promise<CatalogLoadResult> {
  if (!catalogLoadPromise) {
    catalogLoadPromise = (async () => {
      try {
        const remoteSets = await fetchRemoteSets();
        return { sets: remoteSets, fromBackup: false, notice: null };
      } catch {
        return {
          sets: [],
          fromBackup: false,
          notice: 'Could not load datasets from Reclaimed-Design-Systems catalog.json.',
        };
      }
    })();
  }
  return catalogLoadPromise;
}
