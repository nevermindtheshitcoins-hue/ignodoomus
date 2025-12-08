// api/generate-questions.ts
// Vercel Node function for generating Qai1–Qai5 questions

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateQuestionsBody {
  industry: string;
  goal: string;
  pain: string;
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

  const body: GenerateQuestionsBody = req.body;

  if (!body?.industry || !body?.goal || !body?.pain) {
    res.status(400).json({ error: 'Missing required fields: industry, goal, pain' });
    return;
  }

  const prompt = `
You are crafting personalized questions for a ${body.industry} organization that wants to ${body.goal} and is concerned about ${body.pain}.

Generate exactly 5 multiple-choice questions (6 options each) that:
1. Reference their specific industry and stated goals
2. Reveal operational constraints, competitive pressures, and stakeholder dynamics
3. Progress from broad context (Qai1) to strategic implications (Qai5)
4. Avoid repeating the exact words they used in their answers

Output format:
Qai1: [Question text]
1) [Option]
2) [Option]
3) [Option]
4) [Option]
5) [Option]
6) [Option]

Qai2: ...
[repeat through Qai5]

Do NOT include an "Other" option. The UI supplies button 7 as Other with user-provided text.
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
              'You generate structured multiple choice questions for a governance console UI. Follow the output format exactly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const text = completion.choices[0]?.message?.content ?? '';
      if (!text) {
        throw new Error('Empty response from model');
      }

      // Parse into structured shape: [{ code, question, options: string[6] }, ...]
      const blocks = text.split(/Qai[1-5]:/).filter((b) => b.trim().length > 0);

      const questions = blocks.slice(0, 5).map((block, index) => {
        const lines = block.trim().split('\n').map((l) => l.trim()).filter(Boolean);
        const questionText = lines[0];

        const optionLines = lines
          .slice(1)
          .filter((line) => /^[1-6]\)/.test(line))
          .slice(0, 6);

        const options = optionLines.map((line) => line.replace(/^[1-6]\)\s*/, '').trim());

        return {
          code: `Qai${index + 1}`,
          question: questionText,
          options,
        };
      });

      if (questions.length !== 5 || questions.some((q) => q.options.length !== 6)) {
        throw new Error('Parsed questions do not meet 5×6 requirement');
      }

      res.status(200).json({ questions });
      return;
    } catch (err) {
      lastError = err;
      // simple exponential backoff
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }

  res.status(500).json({
    error: 'Failed to generate questions after retries',
    details: String(lastError),
  });
}
