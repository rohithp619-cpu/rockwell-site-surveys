const REGIONAL_URL =
  'https://earthquake.usgs.gov/fdsnws/event/1/query?' +
  new URLSearchParams({
    format: 'geojson',
    minlatitude: '45',
    maxlatitude: '65',
    minlongitude: '-15',
    maxlongitude: '25',
    minmagnitude: '1.5',
    orderby: 'time',
    limit: '12',
  });

const GLOBAL_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

const TTL = 5 * 60_000;

export type SeismicEvent = {
  id: string;
  magnitude: number;
  place: string;
  depth_km: number;
  time_ms: number;
  significance: number;
  url: string;
};

export type SeismicData = {
  regional: SeismicEvent[];
  global_significant: SeismicEvent[];
  fetched_at: number;
};

let cache: { data: SeismicData; ts: number } | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEvent(f: any): SeismicEvent {
  return {
    id: f.id,
    magnitude: Math.round(f.properties.mag * 10) / 10,
    place: f.properties.place ?? 'Unknown location',
    depth_km: Math.round(f.geometry.coordinates[2]),
    time_ms: f.properties.time,
    significance: f.properties.sig ?? 0,
    url: f.properties.url ?? '',
  };
}

export async function fetchSeismic(): Promise<SeismicData> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;

  const [regionalRes, globalRes] = await Promise.all([
    fetch(REGIONAL_URL),
    fetch(GLOBAL_URL),
  ]);

  if (!regionalRes.ok) throw new Error(`USGS regional fetch failed: ${regionalRes.status}`);
  if (!globalRes.ok) throw new Error(`USGS global fetch failed: ${globalRes.status}`);

  const [regionalJson, globalJson] = await Promise.all([
    regionalRes.json(),
    globalRes.json(),
  ]);

  const data: SeismicData = {
    regional: (regionalJson.features ?? []).map(toEvent),
    global_significant: (globalJson.features ?? []).slice(0, 6).map(toEvent),
    fetched_at: Date.now(),
  };

  cache = { data, ts: Date.now() };
  return data;
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

export function buildSeismicContext(data: SeismicData): string {
  const fetchedStr = new Date(data.fetched_at).toISOString().slice(0, 16) + ' UTC';

  const regional = data.regional.length
    ? data.regional
        .map((e) => `  • M${e.magnitude} — ${e.place} — depth ${e.depth_km} km — ${timeAgo(e.time_ms)}`)
        .join('\n')
    : '  No events above M1.5 in this period';

  const global = data.global_significant.length
    ? data.global_significant
        .map((e) => `  • M${e.magnitude} — ${e.place} — ${timeAgo(e.time_ms)}`)
        .join('\n')
    : '  No significant global events recorded this month';

  return `LIVE SEISMIC DATA (USGS Earthquakes API — fetched ${fetchedStr}):

Regional activity — Ireland / UK / Europe (past 30 days, M1.5+):
${regional}

Global significant events (past month):
${global}

When discussing any Rockwell survey, weave in this live seismic data where it is relevant and specific:
— Structural surveys (RS001, RS003, RS006, RS007, RS022): note if recent seismic activity increases the urgency of checking crack patterns, settlement, or structural integrity.
— Geotechnical surveys (RS004, RS005, RS015, RS016): reference earthquake history when discussing soil stability, liquefaction potential, or foundation design.
— Vibration monitoring (RS013, RS014): cite actual recent M-values when explaining why baseline monitoring matters.
— Flood and environmental (RS021, RS025): seismic events can affect drainage infrastructure and embankments.
— Emergency callout (RS027): if a significant event occurred nearby, flag it as a possible trigger.
Always quote actual magnitudes and locations from this data — do not invent figures. If the client's site is in a region with recent activity, say so directly.`;
}
