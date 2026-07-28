export const load = ({ params, url }: { params: { threadId: string }; url: URL }) => ({
  threadId: params.threadId,
  initialMessage: url.searchParams.get('q') ?? null,
});
