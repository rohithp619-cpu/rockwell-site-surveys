import { json } from '@sveltejs/kit';
import { fetchWeather } from '$lib/weather.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const lat = parseFloat(url.searchParams.get('lat') ?? '53.35');
  const lng = parseFloat(url.searchParams.get('lng') ?? '-6.26');
  try {
    const data = await fetchWeather(
      isNaN(lat) ? 53.35 : lat,
      isNaN(lng) ? -6.26 : lng,
    );
    return json(data, {
      headers: { 'Cache-Control': 'public, max-age=600' },
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Weather fetch failed' },
      { status: 502 }
    );
  }
};
