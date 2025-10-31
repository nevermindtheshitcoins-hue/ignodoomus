// Modern OpenAI Service for DPSSv51 Assessment Flow
// Integrates with existing effects system and provides real AI responses

import OpenAI from 'openai';

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const QUESTIONS_PROMPT_TEMPLATE = `You are an expert business consultant specializing in organizational governance and cryptographic trust infrastructure.

Based on the following preliminary assessment:

**Industry Context:** {INDUSTRY}
**Primary Goal:** {GOAL}
**Pain Points:** {PAIN_POINTS}

Generate exactly 5 strategic follow-up questions that will help uncover specific operational constraints, competitive pressures, and stakeholder dynamics that generic questions cannot reveal.

Requirements:
- Each question must provide exactly 6 multiple-choice options (buttons 1-6)
- Button 7 is always reserved for "Other" (custom text input)
- Questions should be progressive in depth: Q1 broad context, Q5 strategic implications
- Questions must reference the user's specific situation
- Avoid repeating the user's own words
- Focus on actionable business intelligence

Return the response in this exact JSON format:
{
  "questions": [
    {
      "id": "qai1",
      "text": "Strategic question text here?",
      "options": [
        "Option 1 with specific context",
        "Option 2 with specific context",
        "Option 3 with specific context",
        "Option 4 with specific context",
        "Option 5 with specific context",
        "Option 6 with specific context"
      ]
    }
    // ... exactly 5 questions
  ]
}`;

const NARRATIVE_PROMPT_TEMPLATE = `You are a senior management consultant specializing in cryptographic governance and organizational transformation.

Based on this comprehensive assessment:

**Industry Context:** {INDUSTRY}
**Primary Goal:** {GOAL}
**Pain Points:** {PAIN_POINTS}

**All Answers:** {ALL_ANSWERS}

Create a professional strategic narrative (600-800 words) formatted as a business document that demonstrates how DeVOTE's verifiable governance platform solves their specific challenges.

The narrative should be formatted as one of these document types (choose the most appropriate):
1. **Investor Memo** - For funding-focused organizations
2. **Case Study** - For operational improvement focused
3. **Internal Strategic Report** - For compliance/transparency focused
4. **Regulatory Submission** - For heavily regulated industries

Key DeVOTE capabilities to highlight:
- Zero-knowledge proof verification (<3 seconds)
- Immutable blockchain audit trails
- Sybil-resistant identity systems
- Multi-party computation for privacy
- 92% cost reduction vs legacy systems

Structure the document with:
- Executive Summary (2-3 paragraphs)
- Strategic Implementation (4-5 paragraphs)
- Technical Architecture (2-3 paragraphs)
- Expected Outcomes (2-3 paragraphs)
- Next Steps (numbered list)

Use professional business language. Make it sound like it was written by McKinsey or Deloitte consultants.`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const buildQuestionsPrompt = (industry: string, goal: string, painPoints: string): string => {
  return QUESTIONS_PROMPT_TEMPLATE
    .replace('{INDUSTRY}', industry)
    .replace('{GOAL}', goal)
    .replace('{PAIN_POINTS}', painPoints);
};

const buildNarrativePrompt = (
  industry: string,
  goal: string,
  painPoints: string,
  allAnswers: string
): string => {
  return NARRATIVE_PROMPT_TEMPLATE
    .replace('{INDUSTRY}', industry)
    .replace('{GOAL}', goal)
    .replace('{PAIN_POINTS}', painPoints)
    .replace('{ALL_ANSWERS}', allAnswers);
};

const extractQuestionsFromResponse = (content: string): any => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions.map((q: any, index: number) => ({
        id: `qai${index + 1}`,
        text: q.text || q.question,
        options: Array.isArray(q.options) ? q.options.slice(0, 6) : [],
        source: 'openai'
      }));
    }
    throw new Error('Invalid questions format');
  } catch (error) {
    // Fallback: extract questions using regex
    const questionMatches = content.match(/Question \d+: ([^\n?]+)\?*\n([^]*?)(?=Question \d+:|$)/g);
    if (questionMatches) {
      return questionMatches.map((match: string, index: number) => {
        const lines = match.split('\n').filter(line => line.trim());
        const question = lines[0].replace(/Question \d+: /, '');
        const options = lines.slice(1).map(opt => opt.replace(/^[A-F]\.?\s*/, '')).slice(0, 6);
        return {
          id: `qai${index + 1}`,
          text: question,
          options: options.length >= 6 ? options : options.concat(['Custom option 1', 'Custom option 2', 'Custom option 3', 'Custom option 4', 'Custom option 5', 'Custom option 6']).slice(0, 6),
          source: 'openai'
        };
      });
    }
    throw new Error('Could not parse questions from response');
  }
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const generateAIQuestionsAPI = async (
  industry: string,
  goal: string,
  painPoints: string
): Promise<any[]> => {
  try {
    const prompt = buildQuestionsPrompt(industry, goal, painPoints);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using cost-effective model
      messages: [
        {
          role: 'system',
          content: 'You are a business consultant. Respond only with valid JSON. Do not include markdown formatting or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return extractQuestionsFromResponse(content);
  } catch (error) {
    console.error('OpenAI Questions API Error:', error);
    throw error;
  }
};

export const generateNarrativeAPI = async (
  industry: string,
  goal: string,
  painPoints: string,
  allAnswers: string
): Promise<string> => {
  try {
    const prompt = buildNarrativePrompt(industry, goal, painPoints, allAnswers);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using full model for complex narrative generation
      messages: [
        {
          role: 'system',
          content: 'You are a senior management consultant. Write a professional business document. Use clear sections and professional language.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 3000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content.trim();
  } catch (error) {
    console.error('OpenAI Narrative API Error:', error);
    throw error;
  }
};

// ============================================================================
// CONFIGURATION
// ============================================================================

export const OPENAI_CONFIG = {
  models: {
    questions: 'gpt-4o-mini', // Cost-effective for question generation
    narrative: 'gpt-4o'       // Full model for complex narratives
  },
  limits: {
    questionsMaxTokens: 2000,
    narrativeMaxTokens: 3000,
    temperature: 0.7
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export const validateAPIKey = (): boolean => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  return Boolean(apiKey && apiKey.startsWith('sk-'));
};

export const getAPIStatus = () => ({
  hasKey: validateAPIKey(),
  client: Boolean(openai.apiKey)
});
