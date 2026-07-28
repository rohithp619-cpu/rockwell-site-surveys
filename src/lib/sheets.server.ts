import type { Service } from '$lib/services';

const SHEET_CSV = 'https://docs.google.com/spreadsheets/d/1RsgmK5VoY2uQI-636AXH2LvwBHGDDsyp76T1Cu1D37U/export?format=csv';
const TTL = 60_000;

let cache: { data: Service[]; ts: number } | null = null;

export async function fetchServices(): Promise<Service[]> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;

  const res = await fetch(SHEET_CSV);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const csv = await res.text();
  const data = parseSheet(csv);
  cache = { data, ts: Date.now() };
  return data;
}

function parseSheet(csv: string): Service[] {
  const lines = csv.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const [header, ...rows] = lines;
  const cols = parseLine(header);

  return rows
    .map((row) => {
      const vals = parseLine(row);
      const o = Object.fromEntries(cols.map((k, i) => [k, vals[i] ?? '']));
      return {
        id: o.service_id,
        name: o.service_name,
        category: o.category,
        region: o.region,
        feeEur: Number(o.fee_eur),
        durationDays: Number(o.duration_days),
        availability: o.availability,
        slotsThisWeek: Number(o.slots_this_week),
        specialOffer: o.special_offer || undefined,
        description: o.description,
      } satisfies Service;
    })
    .filter((s) => s.id);
}

function parseLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      result.push(cur); cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

export function buildServiceContext(services: Service[]): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const rows = services.map((s) => {
    const offer = s.specialOffer ? ` [OFFER: ${s.specialOffer}]` : '';
    const slots = s.slotsThisWeek === 0 ? 'waitlist' : `${s.slotsThisWeek} slot${s.slotsThisWeek === 1 ? '' : 's'}`;
    return `${s.id} · ${s.name} · ${s.region} · ${fmt(s.feeEur)} · ${s.durationDays}d · ${slots} · ${s.availability}${offer}`;
  });

  return `LIVE SERVICE CATALOGUE (updated ${new Date().toISOString().slice(0, 16)} UTC):\n${rows.join('\n')}`;
}
