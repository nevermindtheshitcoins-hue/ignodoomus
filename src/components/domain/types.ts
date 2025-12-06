// DeVOTE Scenario Builder - Core Domain Types

/**
 * Single preliminary question definition from YAML
 */
export interface PreliminaryQuestion {
  id: string;
  step: string;
  question: string;
  instructions: string;
  options: string[];
}

/**
 * Complete preliminary questions configuration
 * Maps to the YAML structure in flow/preliminary-questions.yaml
 */
export interface PreliminaryQuestions {
  qp1: PreliminaryQuestion;
  qp2: PreliminaryQuestion;
  qp3: PreliminaryQuestion;
}

/**
 * AI-generated follow-up question
 */
export interface AIGeneratedQuestion {
  id: string;
  text: string;
  options: string[];
  source: 'mock' | 'ai';
}

/**
 * Assessment step identifiers
 */
export type PreliminaryStep = 'Qp1' | 'Qp2' | 'Qp3';
export type AIStep = 'Qai1' | 'Qai2' | 'Qai3' | 'Qai4' | 'Qai5';
export type ReportStep = 'REPORT';
export type AssessmentStep = PreliminaryStep | AIStep | ReportStep;

/**
 * Resolved answer after combining selection or other text
 */
export interface ResolvedAnswer {
  label: string;
  source: 'selection' | 'other' | 'fallback';
}

/**
 * Industry profile for AI prompting
 */
export interface IndustryProfile {
  id: string;
  name: string;
  keywords: string[];
  proofPoints: string[];
  dramaticEngine: string;
  vesselType: string;
}

/**
 * Narrative output configuration
 */
export interface NarrativeConfig {
  vesselType: 'investor_memo' | 'case_study' | 'internal_report' | 'regulatory_submission';
  dramaticEngine: string;
  proofPoints: string[];
  wordCount: {
    min: number;
    max: number;
  };
}

/**
 * Session metadata (no PII stored)
 */
export interface SessionMetadata {
  id: string;
  startedAt: number;
  completedAt?: number;
  stepCount: number;
}

/**
 * Error types for the assessment flow
 */
export type AssessmentErrorType = 
  | 'AI_GENERATION_FAILED'
  | 'NARRATIVE_GENERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'TIMEOUT';

export interface AssessmentError {
  type: AssessmentErrorType;
  message: string;
  retryable: boolean;
  timestamp: number;
}
