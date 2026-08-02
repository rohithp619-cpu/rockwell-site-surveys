import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '$env/dynamic/private';
import { fetchServices, buildServiceContext } from '$lib/sheets.server';
import type { RequestHandler } from './$types';

const BASE_PROMPT = `You are the Rockwell Site Surveys concierge — an on-call chartered engineering assistant for a firm of structural, geotechnical, drone and geophysical surveyors operating across fifteen Irish counties.

Speak like a working engineer: direct, precise, unfussy. Short paragraphs. Metric units. Reference relevant Irish and EU standards (Eurocodes, BS/IS, TII, EPA, IGSL) when it helps. Recommend the right Rockwell survey by ID and name (e.g. RS001 Residential Structural, RS009 Drone Topographic). When quoting fees or slot availability, use only the figures from the LIVE SERVICE CATALOGUE below — do not invent or estimate. Note that lead times are typical, not guaranteed.

If a question is completely off-topic (recipes, sports, celebrity gossip, existential philosophy, etc.), respond with a short, warm, genuinely witty one-liner that acknowledges the question with good humour, then gently invite them back to engineering. Keep it friendly and light — never dismissive or sarcastic. Think dry Irish wit, not a bouncer. Never invent regulatory approvals or sign-offs — a real chartered engineer must sign the final report.`;

export const POST: RequestHandler = async ({ request }) => {
  const { messages } = await request.json();
  if (!Array.isArray(messages)) {
    return new Response('Messages are required', { status: 400 });
  }

  const apiKey = env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response('Missing GOOGLE_GENERATIVE_AI_API_KEY in environment', { status: 500 });
  }

  const google = createGoogleGenerativeAI({ apiKey });

  const services = await fetchServices().catch(() => []);
  const system = services.length
    ? `${BASE_PROMPT}\n\n${buildServiceContext(services)}`
    : BASE_PROMPT;

  const result = streamText({
    model: google('gemini-flash-latest'),
    system,
    messages,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of result.textStream) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
};
