// Effects (Service Layer) for DPSSv51 Assessment Flow - Phase 1.4 Implementation
// Provides AI integration stubs with timeout/retry logic and mocked data

import type { AIQuestion, AnswersState } from '../app/StateMachine';
import type { PreliminaryQuestions } from '../domain/types';
import preliminaryQuestionsData from '../flow/preliminary-questions.yaml';
import {
  buildAiPromptContext,
  buildIndustryMockQuestions,
  buildMockNarrative,
  buildResolvedAnswers,
  normaliseOptions,
  summariseAnswers,
} from './mockContent';
import { generateAIQuestionsAPI, generateNarrativeAPI, validateAPIKey } from './openaiService';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GenerateQuestionsParams {
  qp1Selection?: number;
  qp1Other?: string;
  qp2Selection?: number;
  qp2Other?: string;
  qp3Selection?: number;
  qp3Other?: string;
}

export interface GenerateNarrativeParams {
  qp1Selection?: number;
  qp1Other?: string;
  qp2Selection?: number;
  qp2Other?: string;
  qp3Selection?: number;
  qp3Other?: string;
  q1Selection?: number;
  q1Other?: string;
  q2Selection?: number;
  q2Other?: string;
  q3Selection?: number;
  q3Other?: string;
  q4Selection?: number;
  q4Other?: string;
  q5Selection?: number;
  q5Other?: string;
}

export interface EffectsConfig {
  timeoutMs: number;
  maxRetries: number;
  baseDelayMs: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: EffectsConfig = {
  timeoutMs: 10000, // 10 seconds as per commandments
  maxRetries: 3,
  baseDelayMs: 1000, // 1s, 2s, 4s exponential backoff
};

const OPENAI_AVAILABLE = validateAPIKey();

const questionId = (index: number): string => `qai${index + 1}`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const createExponentialBackoffDelay = (attempt: number, baseDelay: number): number =>
  Math.min(baseDelay * Math.pow(2, attempt), 30000); // Cap at 30 seconds

// ============================================================================
// MOCKED DATA GENERATORS
// ============================================================================

const defaultPreliminaryQuestions = preliminaryQuestionsData as PreliminaryQuestions;

const mapParamsToAnswers = (params: GenerateQuestionsParams): AnswersState => ({
  qp1Selection: params.qp1Selection as AnswersState['qp1Selection'],
  qp1Other: params.qp1Other,
  qp2Selection: params.qp2Selection as AnswersState['qp2Selection'],
  qp2Other: params.qp2Other,
  qp3Selection: params.qp3Selection as AnswersState['qp3Selection'],
  qp3Other: params.qp3Other,
});

const generateMockQuestions = (params: GenerateQuestionsParams): AIQuestion[] => {
  const answers = mapParamsToAnswers(params);
  const resolved = buildResolvedAnswers(answers, defaultPreliminaryQuestions);
  return buildIndustryMockQuestions(resolved);
};

const mapNarrativeParamsToAnswers = (params: GenerateNarrativeParams): AnswersState => ({
  ...mapParamsToAnswers(params),
  q1Selection: params.q1Selection as AnswersState['q1Selection'],
  q1Other: params.q1Other,
  q2Selection: params.q2Selection as AnswersState['q2Selection'],
  q2Other: params.q2Other,
  q3Selection: params.q3Selection as AnswersState['q3Selection'],
  q3Other: params.q3Other,
  q4Selection: params.q4Selection as AnswersState['q4Selection'],
  q4Other: params.q4Other,
  q5Selection: params.q5Selection as AnswersState['q5Selection'],
  q5Other: params.q5Other,
});

const generateMockNarrative = (params: GenerateNarrativeParams): string => {
  const answers = mapNarrativeParamsToAnswers(params);
  const resolved = buildResolvedAnswers(answers, defaultPreliminaryQuestions);
  return buildMockNarrative(resolved);
};

// ============================================================================
// AI SERVICE FUNCTIONS
// ============================================================================

export const generateAIQuestions = async (
  params: GenerateQuestionsParams,
  config: EffectsConfig = DEFAULT_CONFIG
): Promise<AIQuestion[]> => {
  const { maxRetries } = config;

  if (!OPENAI_AVAILABLE) {
    return generateMockQuestions(params);
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const answers = mapParamsToAnswers(params);
      const resolved = buildResolvedAnswers(answers, defaultPreliminaryQuestions);
      const promptContext = buildAiPromptContext(resolved);

      const response = await generateAIQuestionsAPI(
        promptContext.industry,
        promptContext.goal,
        promptContext.pain,
      );

      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('OpenAI returned no questions');
      }

      return response.map((item, index) => ({
        id: item.id ?? questionId(index),
        text: (item.text ?? '').trim(),
        options: normaliseOptions(item.options ?? [], 6),
        source: 'ai' as const,
      }));
    } catch (error) {
      console.error(`AI Questions generation attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed to generate AI questions after ${maxRetries + 1} attempts`);
      }

      const backoffDelay = createExponentialBackoffDelay(attempt, config.baseDelayMs);
      await delay(backoffDelay);
    }
  }

  throw new Error('Unexpected error in generateAIQuestions');
};

export const generateNarrative = async (
  params: GenerateNarrativeParams,
  config: EffectsConfig = DEFAULT_CONFIG
): Promise<string> => {
  const { maxRetries } = config;

  if (!OPENAI_AVAILABLE) {
    return generateMockNarrative(params);
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const answers = mapNarrativeParamsToAnswers(params);
      const resolved = buildResolvedAnswers(answers, defaultPreliminaryQuestions);
      const promptContext = buildAiPromptContext(resolved);
      const summary = summariseAnswers(answers, defaultPreliminaryQuestions);

      const narrative = await generateNarrativeAPI(
        promptContext.industry,
        promptContext.goal,
        promptContext.pain,
        summary,
      );

      if (!narrative || narrative.trim().length === 0) {
        throw new Error('OpenAI returned an empty narrative');
      }

      return narrative.trim();
    } catch (error) {
      console.error(`Narrative generation attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed to generate narrative after ${maxRetries + 1} attempts`);
      }

      const backoffDelay = createExponentialBackoffDelay(attempt, config.baseDelayMs);
      await delay(backoffDelay);
    }
  }

  throw new Error('Unexpected error in generateNarrative');
};

// ============================================================================
// INTEGRATION HELPERS
// ============================================================================

export const createEffectsService = (config?: Partial<EffectsConfig>) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return {
    generateQuestions: (params: GenerateQuestionsParams) =>
      generateAIQuestions(params, finalConfig),

    generateNarrative: (params: GenerateNarrativeParams) =>
      generateNarrative(params, finalConfig),
  };
};

// ============================================================================
// ERROR TYPES
// ============================================================================

export class EffectsError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly attempt: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'EffectsError';
  }
}

export class TimeoutError extends EffectsError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `${operation} timed out after ${timeoutMs}ms`,
      operation,
      0
    );
    this.name = 'TimeoutError';
  }
}
