import type { AnswersState } from '../app/StateMachine';
import type { PreliminaryQuestions } from '../domain/types';

const OTHER_MIN_LENGTH = 5;

const sanitizeOther = (value: string | undefined | null): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length < OTHER_MIN_LENGTH) {
    return null;
  }
  return trimmed;
};

const getOptionLabel = (options: string[] | undefined, selection?: number): string | null => {
  if (!options || !selection) {
    return null;
  }
  const index = selection - 1;
  if (index < 0 || index >= options.length) {
    return null;
  }
  const label = options[index]?.trim();
  return label && label.length > 0 ? label : null;
};

interface ResolvedAnswer {
  label: string;
  source: 'selection' | 'other' | 'fallback';
}

const createResolvedAnswer = (
  selectionLabel: string | null,
  otherValue: string | null,
  fallback: string,
): ResolvedAnswer => {
  if (otherValue) {
    return { label: otherValue, source: 'other' };
  }
  if (selectionLabel) {
    return { label: selectionLabel, source: 'selection' };
  }
  return { label: fallback, source: 'fallback' };
};

export interface ResolvedPreliminaryAnswers {
  role: ResolvedAnswer;
  industry: ResolvedAnswer;
  pain: ResolvedAnswer;
}

export const resolvePreliminaryAnswers = (
  answers: AnswersState,
  preliminary: PreliminaryQuestions,
): ResolvedPreliminaryAnswers => {
  const role = createResolvedAnswer(
    getOptionLabel(preliminary.qp1.options, answers.qp1Selection),
    sanitizeOther(answers.qp1Other),
    'Decision lead',
  );

  const industry = createResolvedAnswer(
    getOptionLabel(preliminary.qp2.options, answers.qp2Selection),
    sanitizeOther(answers.qp2Other),
    'Cross-industry governance',
  );

  const pain = createResolvedAnswer(
    getOptionLabel(preliminary.qp3.options, answers.qp3Selection),
    sanitizeOther(answers.qp3Other),
    'Proof gaps in critical decisions',
  );

  return { role, industry, pain };
};

export type PreliminaryAnswerKey = keyof AnswersState &
  ('qp1Selection' | 'qp2Selection' | 'qp3Selection');

export const getPreliminaryLabel = (
  answers: AnswersState,
  preliminary: PreliminaryQuestions,
  key: 'role' | 'industry' | 'pain',
): string => {
  const resolved = resolvePreliminaryAnswers(answers, preliminary);
  return resolved[key].label;
};
