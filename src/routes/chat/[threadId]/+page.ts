import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, parent }) => {
  const { services } = await parent();
  const surveyId = url.searchParams.get('survey') ?? null;
  const service = surveyId ? (services.find((s: { id: string }) => s.id === surveyId) ?? null) : null;
  return {
    threadId: params.threadId,
    initialMessage: url.searchParams.get('q') ?? null,
    surveyId,
    surveyName: service?.name ?? url.searchParams.get('surveyName') ?? null,
    surveyRegion: service?.region ?? url.searchParams.get('region') ?? null,
  };
};
