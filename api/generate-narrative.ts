// api/generate-narrative.ts
// Vercel Node function for narrative assembly

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NarrativeBody {
  industry: string;
  goal: string;
  pain: string;
  aiAnswers: string[]; // Qai1–Qai5 answers (labels or Other text)
  vesselType?: string; // e.g. "Investor Memo"
  dramaticEngine?: string; // e.g. "Crisis Averted"
  proofPoints?: string[]; // e.g. ["ZK-Verified Tally", ...]
}

const MAX_RETRIES = 3;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY is not configured' });
    return;
  }

  const body: NarrativeBody = req.body;

  if (!body?.industry || !body?.goal || !body?.pain || !Array.isArray(body.aiAnswers)) {
    res.status(400).json({ error: 'Missing required fields: industry, goal, pain, aiAnswers[]' });
    return;
  }

  const vessel = body.vesselType || 'Investor Memo';
  const engine = body.dramaticEngine || 'Legacy Transformed';
  const proofPoints = body.proofPoints?.slice(0, 3) ?? [
    'ZK-Verified Tally',
    'Immutable Audit Trail',
    'Cost-Per-Trust Metric',
  ];

  const answersSummary = body.aiAnswers
    .map((answer, idx) => `Qai${idx + 1}: ${answer}`)
    .join('\n');

  const prompt = `
You are writing a ${vessel} for a ${body.industry} organization.

Context from their answers:
- Primary Goal: ${body.goal}
- Key Vulnerability: ${body.pain}
- Additional Context:
${answersSummary}

Narrative Requirements:
- Format: ${vessel} (follow standard business document structure)
- Emotional Arc: ${engine}
- Must incorporate these DeVOTE capabilities: ${proofPoints.join(', ')}

Write a 600-800 word document that:
1. Opens with a compelling hook referencing their pain point
2. Explains how DeVOTE's verifiable governance solves their specific problem
3. Integrates proof points as concrete mechanisms, not buzzwords
4. Concludes with a clear outcome scenario
5. Uses professional tone appropriate for stakeholder presentation

Do not use generic corporate language. Make it feel personalized to their situation.
`.trim();

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You write tailored governance narratives for organizations. Follow the length and structure requirements exactly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1400,
      });

      const text = completion.choices[0]?.message?.content ?? '';
      if (!text) {
        throw new Error('Empty response from model');
      }

      res.status(200).json({ narrative: text });
      return;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }

  res.status(500).json({
    error: 'Failed to generate narrative after retries',
    details: String(lastError),
  });
}
