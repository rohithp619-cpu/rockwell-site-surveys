import { json } from '@sveltejs/kit';
import { fetchSeismic } from '$lib/seismic.server';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const data = await fetchSeismic();
    return json(data, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : 'Seismic fetch failed' },
      { status: 502 }
    );
  }
};
