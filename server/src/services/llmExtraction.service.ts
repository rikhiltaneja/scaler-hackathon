import Anthropic from '@anthropic-ai/sdk';
import type { VisitFields, Vitals } from 'shared';
import { createEmptyVisit, VISIT_SCHEMA_TOOL } from '../schema/visitSchema.js';

export type ExtractedVisit = VisitFields & { mockMode?: boolean };

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

// Client is only created if a key is present. This lets the rest of the
// pipeline (voice input -> transcript -> form) run and be demoed before
// an API key is wired in; see mockExtract() below.
const client = apiKey ? new Anthropic({ apiKey }) : null;

/**
 * Turns a raw speech transcript of an ASHA home-visit into a structured
 * visit record. Falls back to a clearly-labeled mock extraction when no
 * ANTHROPIC_API_KEY is configured, so the rest of the app is testable
 * without a key.
 */
export async function extractStructuredVisit(
  transcript: string,
  { language = 'en' }: { language?: string } = {},
): Promise<ExtractedVisit> {
  if (!client) {
    return mockExtract(transcript);
  }

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system:
      'You are an assistant that converts a spoken field note from an ASHA (Accredited Social Health ' +
      'Activist, a community health worker in India) home visit into a structured record. ' +
      'The transcript may be in English, Hindi, or a mix of both (Hinglish). ' +
      'Extract only what is explicitly said or very clearly implied. Never invent vitals, dates, or ' +
      'medication names that were not mentioned. Use the record_visit tool to return your answer.',
    messages: [
      {
        role: 'user',
        content: `Transcript (spoken language hint: ${language}):\n"""${transcript}"""`,
      },
    ],
    tools: [VISIT_SCHEMA_TOOL],
    tool_choice: { type: 'tool', name: VISIT_SCHEMA_TOOL.name },
  });

  const toolUse = message.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    return mockExtract(transcript);
  }

  // The model's tool call input is only known at runtime — it's shaped by
  // VISIT_SCHEMA_TOOL but not statically typed by the SDK.
  return mergeWithDefaults(toolUse.input as Partial<VisitFields>);
}

function mergeWithDefaults(partial: Partial<VisitFields>): ExtractedVisit {
  const empty = createEmptyVisit();
  return {
    ...empty,
    ...partial,
    vitals: {
      ...empty.vitals,
      ...(partial.vitals as Partial<Vitals> | undefined),
    },
  };
}

function mockExtract(transcript: string): ExtractedVisit {
  return {
    ...createEmptyVisit(),
    notes: transcript,
    mockMode: true,
  };
}
