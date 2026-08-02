import { fetchServices } from '$lib/sheets.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ setHeaders }) => {
  const services = await fetchServices().catch(() =>
    fetchServices().catch(() => [])
  );

  setHeaders({
    'cache-control': 's-maxage=300, stale-while-revalidate=600',
  });

  return { services };
};
