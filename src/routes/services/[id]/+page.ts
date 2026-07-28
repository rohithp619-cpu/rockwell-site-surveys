import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  const { services } = await parent();
  const s = services.find((x) => x.id.toLowerCase() === params.id.toLowerCase());
  if (!s) throw error(404, 'Service not found');
  return { service: s };
};
