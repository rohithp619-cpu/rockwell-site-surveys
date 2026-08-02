import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, url }) => {
  const { services } = await parent();
  const surveyId = url.searchParams.get('survey') ?? null;
  const surveyName = url.searchParams.get('surveyName') ?? null;
  const region = url.searchParams.get('region') ?? null;
  return { services, surveyId, surveyName, region };
};
