import { fetchServices } from '$lib/sheets.server';

export const load = async () => {
  const services = await fetchServices().catch(() =>
    fetchServices().catch(() => [])
  );
  return { services };
};
