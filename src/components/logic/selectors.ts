import { AssessmentContext, OptionId, AnswersState, AIQuestion } from '../app/StateMachine';
import { isValidOtherText, isValidSelection } from '../domain/guards';
import type { PreliminaryQuestions } from '../domain/types';

export type PreliminaryStepId = 'Qp1' | 'Qp2' | 'Qp3';
export type AIQuestionStepId = 'Qai1' | 'Qai2' | 'Qai3' | 'Qai4' | 'Qai5';
export type QuestionStepId = PreliminaryStepId | AIQuestionStepId;
export type FlowStepId = QuestionStepId | 'REPORT';

export interface HeaderBulbModel {
  step: QuestionStepId;
  digit: OptionId | null;
  lit: boolean;
}

export interface OtherInputModel {
  visible: boolean;
  draft: string;
  valid: boolean;
}

export interface ScreenQuestionModel {
  type: 'question';
  step: QuestionStepId;
  prompt: string;
  options: string[];
  other: OtherInputModel;
  loading: boolean;
  error: string | null;
}

export interface ScreenLoadingModel {
  type: 'loading';
  step: QuestionStepId;
  message: string;
  error: string | null;
}

export interface ScreenReportModel {
  type: 'report';
  narrative: string | null;
  loading: boolean;
  error: string | null;
}

export type ScreenViewModel = ScreenQuestionModel | ScreenLoadingModel | ScreenReportModel;

export interface KeypadButtonModel {
  digit: OptionId;
  label: string;
  selected: boolean;
  disabled: boolean;
}

export interface KeypadViewModel {
  type: 'question' | 'report';
  buttons: KeypadButtonModel[];
}

export interface FooterViewModel {
  confirmEnabled: boolean;
  backEnabled: boolean;
  resetEnabled: boolean;
  loading: boolean;
  error: string | null;
}

const PRELIMINARY_STEPS: ReadonlyArray<{
  step: PreliminaryStepId;
  selectionKey: keyof Pick<AnswersState, 'qp1Selection' | 'qp2Selection' | 'qp3Selection'>;
  otherKey: keyof Pick<AnswersState, 'qp1Other' | 'qp2Other' | 'qp3Other'>;
}> = [
  { step: 'Qp1', selectionKey: 'qp1Selection', otherKey: 'qp1Other' },
  { step: 'Qp2', selectionKey: 'qp2Selection', otherKey: 'qp2Other' },
  { step: 'Qp3', selectionKey: 'qp3Selection', otherKey: 'qp3Other' },
] as const;

const AI_STEPS: ReadonlyArray<{
  step: AIQuestionStepId;
  selectionKey: keyof Pick<
    AnswersState,
    'q1Selection' | 'q2Selection' | 'q3Selection' | 'q4Selection' | 'q5Selection'
  >;
  otherKey: keyof Pick<AnswersState, 'q1Other' | 'q2Other' | 'q3Other' | 'q4Other' | 'q5Other'>;
}> = [
  { step: 'Qai1', selectionKey: 'q1Selection', otherKey: 'q1Other' },
  { step: 'Qai2', selectionKey: 'q2Selection', otherKey: 'q2Other' },
  { step: 'Qai3', selectionKey: 'q3Selection', otherKey: 'q3Other' },
  { step: 'Qai4', selectionKey: 'q4Selection', otherKey: 'q4Other' },
  { step: 'Qai5', selectionKey: 'q5Selection', otherKey: 'q5Other' },
] as const;

const HEADER_STEPS: ReadonlyArray<QuestionStepId> = [
  'Qp1',
  'Qp2',
  'Qp3',
  'Qai1',
  'Qai2',
  'Qai3',
  'Qai4',
  'Qai5',
] as const;

const OTHER_BUTTON: OptionId = 7;

const ensureOptionLabel = (label: string | undefined): string => (label ?? '').trim();

const getDigitForAnswer = (selection?: number, other?: string | null): OptionId | null => {
  if (isValidSelection(selection)) {
    return selection as OptionId;
  }
  if (other && other.length > 0) {
    return OTHER_BUTTON;
  }
  return null;
};

const getAnsweredCount = (pairs: Array<{ selection?: number; other?: string | null }>): number => {
  let count = 0;
  for (const pair of pairs) {
    const digit = getDigitForAnswer(pair.selection, pair.other ?? null);
    if (digit === null) {
      break;
    }
    count += 1;
  }
  return count;
};

export const selectHeaderView = (context: AssessmentContext): HeaderBulbModel[] => {
  const answerLookup: Record<QuestionStepId, OptionId | null> = {} as Record<
    QuestionStepId,
    OptionId | null
  >;

  for (const meta of PRELIMINARY_STEPS) {
    answerLookup[meta.step] = getDigitForAnswer(
      context.answers[meta.selectionKey],
      context.answers[meta.otherKey],
    );
  }

  for (const meta of AI_STEPS) {
    answerLookup[meta.step] = getDigitForAnswer(
      context.answers[meta.selectionKey],
      context.answers[meta.otherKey],
    );
  }

  return HEADER_STEPS.map((step) => ({
    step,
    digit: answerLookup[step] ?? null,
    lit: answerLookup[step] !== null,
  }));
};

const getActiveAiIndex = (context: AssessmentContext): number => {
  // Count how many AI questions have been answered by checking selection/other pairs
  const answeredPairs = AI_STEPS.map((meta) => ({
    selection: context.answers[meta.selectionKey],
    other: context.answers[meta.otherKey],
  }));
  const answeredCount = getAnsweredCount(answeredPairs);
  
  // Ensure we don't exceed the available questions (prevent index out of bounds)
  const maxIndex = Math.max(0, context.ai.questions.length - 1);
  return Math.min(answeredCount, maxIndex >= 0 ? maxIndex : 0);
};

export const selectActiveStep = (context: AssessmentContext): FlowStepId => {
  switch (context.ui.phase) {
    case 'QP1':
      return 'Qp1';
    case 'QP2':
      return 'Qp2';
    case 'QP3':
      return 'Qp3';
    case 'AI_QUESTIONS': {
      // Determine which AI question is currently active based on progress
      const aiIndex = getActiveAiIndex(context);
      // Fallback to Qai1 if no questions are available yet
      return AI_STEPS[aiIndex]?.step ?? 'Qai1';
    }
    case 'REPORT':
      return 'REPORT';
    default:
      return 'Qp1';
  }
};

const getPreliminaryPrompt = (
  step: PreliminaryStepId,
  preliminary: PreliminaryQuestions,
): { prompt: string; options: string[] } => {
  switch (step) {
    case 'Qp1':
      return {
        prompt: preliminary.qp1.question,
        options: preliminary.qp1.options ?? [],
      };
    case 'Qp2':
      return {
        prompt: preliminary.qp2.question,
        options: preliminary.qp2.options ?? [],
      };
    case 'Qp3':
      return {
        prompt: preliminary.qp3.question,
        options: preliminary.qp3.options ?? [],
      };
    default:
      return { prompt: '', options: [] };
  }
};

const coerceOptions = (options: string[], expectedLength: number): string[] => {
  // Ensure we always have exactly the expected number of options
  if (options.length >= expectedLength) {
    // Trim to expected length and clean up labels
    return options.slice(0, expectedLength).map(ensureOptionLabel);
  }
  // Pad with empty strings if we don't have enough options
  return [
    ...options.map(ensureOptionLabel),
    ...Array.from({ length: expectedLength - options.length }, () => ''),
  ];
};

const getAiPrompt = (
  step: AIQuestionStepId,
  context: AssessmentContext,
): { prompt: string; options: string[] } => {
  const aiIndex = AI_STEPS.findIndex((meta) => meta.step === step);
  const question: AIQuestion | undefined = context.ai.questions[aiIndex];
  if (!question) {
    return { prompt: '', options: [] };
  }
  return {
    prompt: question.text,
    options: coerceOptions(question.options ?? [], 6),
  };
};

const getOtherModel = (context: AssessmentContext): OtherInputModel => ({
  visible: context.ui.otherActive,
  draft: context.ui.otherDraft,
  valid: isValidOtherText(context.ui.otherDraft),
});

export const selectScreenView = (
  context: AssessmentContext,
  preliminaryQuestions: PreliminaryQuestions,
): ScreenViewModel => {
  const activeStep = selectActiveStep(context);

  if (activeStep === 'REPORT') {
    return {
      type: 'report',
      narrative: context.ai.narrative,
      loading: context.ui.isLoading,
      error: context.ui.error,
    };
  }

  const other = getOtherModel(context);
  const loading = context.ui.isLoading;
  const error = context.ui.error;

  if (loading && context.ui.phase === 'AI_QUESTIONS' && context.ai.questions.length === 0) {
    return {
      type: 'loading',
      step: 'Qai1',
      message: 'Generating personalized questions…',
      error,
    };
  }

  if (loading && context.ui.phase === 'REPORT' && !context.ai.narrative) {
    return {
      type: 'loading',
      step: 'Qai5',
      message: 'Assembling narrative…',
      error,
    };
  }

  if (activeStep.startsWith('Qp')) {
    const { prompt, options } = getPreliminaryPrompt(
      activeStep as PreliminaryStepId,
      preliminaryQuestions,
    );
    return {
      type: 'question',
      step: activeStep,
      prompt,
      options: coerceOptions(options, 7),
      other,
      loading,
      error,
    };
  }

  const { prompt, options } = getAiPrompt(activeStep as AIQuestionStepId, context);
  return {
    type: 'question',
    step: activeStep,
    prompt,
    options: coerceOptions(options, 6),
    other,
    loading,
    error,
  };
};

export const selectKeypadView = (
  context: AssessmentContext,
  screen: ScreenViewModel,
): KeypadViewModel => {
  if (screen.type === 'report') {
    const buttons: KeypadButtonModel[] = Array.from({ length: 7 }, (_, index) => {
      const digit = (index + 1) as OptionId;
      // Report phase: 1/3/5/7 = CTA link, 2/4/6 = Copy to clipboard
      const isCopyButton = digit === 2 || digit === 4 || digit === 6;
      const isCtaButton = digit === 1 || digit === 3 || digit === 5 || digit === 7;

      let label = '';
      if (isCtaButton) {
        label = 'CTA Link';
      } else if (isCopyButton) {
        label = 'Copy';
      }

      return {
        digit,
        label,
        selected: false,
        disabled: screen.loading,
      };
    });
    return { type: 'report', buttons };
  }

  if (screen.type === 'loading') {
    const buttons: KeypadButtonModel[] = Array.from({ length: 7 }, (_, index) => ({
      digit: (index + 1) as OptionId,
      label: '',
      selected: false,
      disabled: true,
    }));
    return { type: 'question', buttons };
  }

  const isPreliminary = screen.step.startsWith('Qp');
  const baseOptionCount = isPreliminary ? 7 : 6;
  const buttonCount = 7;

  const optionLabels = isPreliminary
    ? screen.options
    : [...screen.options, 'Other (please specify)'];

  const buttons: KeypadButtonModel[] = Array.from({ length: buttonCount }, (_, index) => {
    const digit = (index + 1) as OptionId;
    const label = ensureOptionLabel(optionLabels[index] ?? '');
    const selected = context.ui.selectedOption === digit;
    const disabled = screen.loading;
    return {
      digit,
      label: digit <= baseOptionCount ? label : ensureOptionLabel(optionLabels[index] ?? label),
      selected,
      disabled,
    };
  });

  return { type: 'question', buttons };
};

const isStandardOption = (option: OptionId | null): option is Exclude<OptionId, 7> =>
  option !== null && option !== OTHER_BUTTON;

const canConfirm = (context: AssessmentContext): boolean => {
  const { selectedOption, otherDraft } = context.ui;
  if (isStandardOption(selectedOption)) {
    return true;
  }
  if (selectedOption === OTHER_BUTTON) {
    return isValidOtherText(otherDraft);
  }
  return false;
};

const hasPreviousStep = (context: AssessmentContext): boolean => {
  switch (context.ui.phase) {
    case 'QP1':
      return false;
    case 'QP2':
    case 'QP3':
      return true;
    case 'AI_QUESTIONS': {
      const aiIndex = getActiveAiIndex(context);
      return aiIndex > 0 || PRELIMINARY_STEPS.some((meta) => {
        const digit = getDigitForAnswer(
          context.answers[meta.selectionKey],
          context.answers[meta.otherKey],
        );
        return digit !== null;
      });
    }
    case 'REPORT':
      return false;
    default:
      return false;
  }
};

export const selectFooterView = (context: AssessmentContext): FooterViewModel => ({
  confirmEnabled: !context.ui.isLoading && canConfirm(context),
  backEnabled: !context.ui.isLoading && hasPreviousStep(context),
  resetEnabled: !context.ui.isLoading,
  loading: context.ui.isLoading,
  error: context.ui.error,
});
