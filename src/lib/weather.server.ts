export { wmoLabel, compassDir } from '$lib/weather';
import { wmoLabel, compassDir } from '$lib/weather';

const CURRENT_FIELDS =
  'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility';
const DAILY_FIELDS =
  'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max';

function buildUrl(lat: number, lng: number): string {
  return (
    'https://api.open-meteo.com/v1/forecast?' +
    new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
      current: CURRENT_FIELDS,
      daily: DAILY_FIELDS,
      timezone: 'Europe/Dublin',
      forecast_days: '4',
    })
  );
}

const TTL = 10 * 60_000;

export type WeatherCurrent = {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  visibility: number;
};

export type WeatherDay = {
  date: string;
  weather_code: number;
  temperature_max: number;
  temperature_min: number;
  precipitation_sum: number;
  wind_speed_max: number;
  wind_gusts_max: number;
};

export type SurveyCondition = 'ok' | 'marginal' | 'unsuitable';

export type SurveySuitability = {
  drone: SurveyCondition;
  drone_reason: string;
  structural: SurveyCondition;
  structural_reason: string;
  geotechnical: SurveyCondition;
  geotechnical_reason: string;
};

export type WeatherData = {
  current: WeatherCurrent;
  forecast: WeatherDay[];
  suitability: SurveySuitability;
  fetched_at: number;
};

const cache = new Map<string, { data: WeatherData; ts: number }>();


// Wind speed m/s → Beaufort description (brief)
function beaufortDesc(ms: number): string {
  if (ms < 1.5) return 'calm';
  if (ms < 3.4) return 'light';
  if (ms < 5.5) return 'gentle';
  if (ms < 8) return 'moderate';
  if (ms < 10.8) return 'fresh';
  if (ms < 13.9) return 'strong';
  if (ms < 17.2) return 'near-gale';
  return 'gale';
}

const PRECIPITATION_CODES = new Set([51,53,55,56,57,61,63,65,66,67,71,73,75,77,80,81,82,85,86,95,96,99]);
const FOG_CODES = new Set([45, 48]);
const STORM_CODES = new Set([95, 96, 99]);

function assessDrone(c: WeatherCurrent): Pick<SurveySuitability, 'drone' | 'drone_reason'> {
  if (STORM_CODES.has(c.weather_code))
    return { drone: 'unsuitable', drone_reason: 'Thunderstorm — operations suspended' };
  if (c.wind_gusts_10m > 20)
    return { drone: 'unsuitable', drone_reason: `Gusts ${c.wind_gusts_10m.toFixed(1)} m/s exceed safe limit` };
  if (c.precipitation > 0 || PRECIPITATION_CODES.has(c.weather_code))
    return { drone: 'unsuitable', drone_reason: 'Active precipitation — no-fly' };
  if (FOG_CODES.has(c.weather_code))
    return { drone: 'unsuitable', drone_reason: 'Fog — visibility insufficient' };
  if (c.wind_speed_10m > 13)
    return { drone: 'marginal', drone_reason: `Wind ${c.wind_speed_10m.toFixed(1)} m/s — specialist sign-off required` };
  if (c.wind_speed_10m > 10)
    return { drone: 'marginal', drone_reason: `Wind ${c.wind_speed_10m.toFixed(1)} m/s — reduced endurance, early booking advised` };
  if (c.visibility < 5000)
    return { drone: 'marginal', drone_reason: `Visibility ${(c.visibility / 1000).toFixed(1)} km — reduced capture quality` };
  return { drone: 'ok', drone_reason: `Clear for operations — wind ${c.wind_speed_10m.toFixed(1)} m/s, visibility ${(c.visibility / 1000).toFixed(0)} km` };
}

function assessStructural(c: WeatherCurrent): Pick<SurveySuitability, 'structural' | 'structural_reason'> {
  if (STORM_CODES.has(c.weather_code))
    return { structural: 'marginal', structural_reason: 'Thunderstorm — external inspection deferred' };
  if (c.precipitation > 5)
    return { structural: 'marginal', structural_reason: 'Heavy precipitation — roof/external access limited' };
  return { structural: 'ok', structural_reason: 'Suitable for internal and external inspection' };
}

function assessGeotechnical(c: WeatherCurrent): Pick<SurveySuitability, 'geotechnical' | 'geotechnical_reason'> {
  if (c.precipitation > 2 || STORM_CODES.has(c.weather_code))
    return { geotechnical: 'unsuitable', geotechnical_reason: 'Heavy rain — ground saturation affects test results' };
  if (c.precipitation > 0)
    return { geotechnical: 'marginal', geotechnical_reason: 'Active precipitation — trial pits may flood; percolation test invalid' };
  if (PRECIPITATION_CODES.has(c.weather_code))
    return { geotechnical: 'marginal', geotechnical_reason: 'Precipitation forecast — soakaway/percolation tests deferred' };
  return { geotechnical: 'ok', geotechnical_reason: 'Dry conditions — ground tests valid' };
}

export async function fetchWeather(lat = 53.35, lng = -6.26): Promise<WeatherData> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  const res = await fetch(buildUrl(lat, lng));
  if (!res.ok) throw new Error(`Open-Meteo fetch failed: ${res.status}`);

  const json = await res.json();
  const c = json.current as WeatherCurrent;
  const d = json.daily;

  const forecast: WeatherDay[] = (d.time as string[]).map((date: string, i: number) => ({
    date,
    weather_code: d.weather_code[i],
    temperature_max: d.temperature_2m_max[i],
    temperature_min: d.temperature_2m_min[i],
    precipitation_sum: d.precipitation_sum[i],
    wind_speed_max: d.wind_speed_10m_max[i],
    wind_gusts_max: d.wind_gusts_10m_max[i],
  }));

  const suitability: SurveySuitability = {
    ...assessDrone(c),
    ...assessStructural(c),
    ...assessGeotechnical(c),
  };

  const data: WeatherData = { current: c, forecast, suitability, fetched_at: Date.now() };
  cache.set(key, { data, ts: Date.now() });
  return data;
}

export function buildWeatherContext(w: WeatherData): string {
  const c = w.current;
  const dir = compassDir(c.wind_direction_10m);
  const bft = beaufortDesc(c.wind_speed_10m);
  const fetchedStr = new Date(w.fetched_at).toISOString().slice(0, 16) + ' UTC';

  const dayLines = w.forecast.slice(0, 3).map((d, i) => {
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.date;
    return `  ${label}: ${wmoLabel(d.weather_code)}, ${d.temperature_min.toFixed(0)}–${d.temperature_max.toFixed(0)}°C, rain ${d.precipitation_sum.toFixed(1)} mm, wind max ${d.wind_speed_max.toFixed(1)} m/s (gusts ${d.wind_gusts_max.toFixed(1)} m/s)`;
  });

  const suit = w.suitability;
  const icon = (s: SurveyCondition) => s === 'ok' ? '✓' : s === 'marginal' ? '⚠' : '✗';

  // Compact readout line the AI must echo in responses (format: ✗ Drone · ✓ Struct · ✓ Geo)
  const readout = `${icon(suit.drone)} Drone · ${icon(suit.structural)} Struct · ${icon(suit.geotechnical)} Geo`;

  return `LIVE WEATHER — Ireland (Open-Meteo — fetched ${fetchedStr}):
Current: ${c.temperature_2m.toFixed(1)}°C (feels ${c.apparent_temperature.toFixed(1)}°C) · ${wmoLabel(c.weather_code)} · Wind ${c.wind_speed_10m.toFixed(1)} m/s ${dir} (${bft}), gusts ${c.wind_gusts_10m.toFixed(1)} m/s · Precipitation ${c.precipitation} mm · Humidity ${c.relative_humidity_2m}% · Visibility ${(c.visibility / 1000).toFixed(1)} km

Suitability readout (use this exact line in your response when conditions are relevant):
${readout}

Suitability detail:
  ${icon(suit.drone)} Drone: ${suit.drone.toUpperCase()} — ${suit.drone_reason}
  ${icon(suit.structural)} Struct: ${suit.structural.toUpperCase()} — ${suit.structural_reason}
  ${icon(suit.geotechnical)} Geo: ${suit.geotechnical.toUpperCase()} — ${suit.geotechnical_reason}

3-day forecast:
${dayLines.join('\n')}

Always reference this live weather when discussing survey scheduling or fieldwork conditions. If a drone survey is unsuitable today, suggest the nearest suitable window from the forecast. For geotechnical surveys, ground saturation from recent rain must be factored into test validity. Cite actual figures from this data — temperature, wind speed, precipitation — rather than generalising.`;
}

export { beaufortDesc };
