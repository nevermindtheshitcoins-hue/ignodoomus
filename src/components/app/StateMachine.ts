import { assign, createMachine } from 'xstate';

export type OptionId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type StandardOptionId = Exclude<OptionId, 7>;
type Phase = 'QP1' | 'QP2' | 'QP3' | 'AI_QUESTIONS' | 'REPORT';

const OTHER_BUTTON: OptionId = 7;
const OTHER_MIN_LENGTH = 5;
const OTHER_MAX_LENGTH = 50;

export interface AIQuestion {
  id: string;
  text: string;
  options: string[]; // Expect exactly 6 entries; UI provides button 7 (Other)
  source: 'mock' | 'ai';
}

export interface SessionState {
  id: string;
  stepIndex: number; // 0-7 journey across QP1-QP3 + Q1-Q5
  sessionCode: string;
}

export interface AnswersState {
  // Preliminary questions (QP1-QP3)
  qp1Selection?: StandardOptionId;
  qp1Other?: string;
  qp2Selection?: StandardOptionId;
  qp2Other?: string;
  qp3Selection?: StandardOptionId;
  qp3Other?: string;

  // AI question placeholders (Q1-Q5)
  q1Selection?: StandardOptionId;
  q1Other?: string;
  q2Selection?: StandardOptionId;
  q2Other?: string;
  q3Selection?: StandardOptionId;
  q3Other?: string;
  q4Selection?: StandardOptionId;
  q4Other?: string;
  q5Selection?: StandardOptionId;
  q5Other?: string;
}

export interface AIState {
  questions: AIQuestion[];
  narrative: string | null;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  phase: Phase;
  otherActive: boolean;
  otherDraft: string;
  selectedOption: OptionId | null;
}

export interface AssessmentContext {
  session: SessionState;
  answers: AnswersState;
  ai: AIState;
  ui: UIState;
}

export const createInitialContext = (): AssessmentContext => ({
  session: {
    id: '',
    stepIndex: 0,
    sessionCode: '',
  },
  answers: {},
  ai: {
    questions: [],
    narrative: null,
  },
  ui: {
    isLoading: false,
    error: null,
    phase: 'QP1',
    otherActive: false,
    otherDraft: '',
    selectedOption: null,
  },
});

type SelectOptionEvent = { type: 'SELECT_OPTION'; option: OptionId };
type EnterOtherTextEvent = { type: 'ENTER_OTHER_TEXT'; text: string };
type ConfirmEvent = { type: 'CONFIRM' };
type BackEvent = { type: 'BACK' };
type ResetEvent = { type: 'RESET' };
type AIQuestionsReadyEvent = { type: 'AI_QUESTIONS_READY'; questions: AIQuestion[] };
type NarrativeReadyEvent = { type: 'NARRATIVE_READY'; narrative: string };
type ErrorEvent = { type: 'ERROR'; message: string };

export type AssessmentEvent =
  | SelectOptionEvent
  | EnterOtherTextEvent
  | ConfirmEvent
  | BackEvent
  | ResetEvent
  | AIQuestionsReadyEvent
  | NarrativeReadyEvent
  | ErrorEvent;

const sanitizeOtherInput = (value: string): string =>
  value.replace(/[\r\n\u2028\u2029]/g, ' ').slice(0, OTHER_MAX_LENGTH);

const trimToValidationWindow = (value: string): string => value.trim();

const isStandardOption = (option: OptionId | null): option is StandardOptionId =>
  option !== null && option !== OTHER_BUTTON;

const hasValidOtherDraft = (draft: string): boolean => {
  const trimmed = trimToValidationWindow(draft);
  return trimmed.length >= OTHER_MIN_LENGTH && trimmed.length <= OTHER_MAX_LENGTH;
};

const mapAnswerToDigit = (
  selection?: StandardOptionId,
  other?: string,
): OptionId | null => {
  if (typeof selection === 'number') {
    return selection as OptionId;
  }
  if (other && other.length > 0) {
    return OTHER_BUTTON;
  }
  return null;
};

const selectOption = assign<AssessmentContext, AssessmentEvent>((context, event) => {
  if (event.type !== 'SELECT_OPTION') {
    return {};
  }

  // Determine if user selected "Other" option (button 7)
  const otherActive = event.option === OTHER_BUTTON;
  return {
    ui: {
      ...context.ui,
      selectedOption: event.option,
      otherActive,
      // Clear other draft if not selecting Other, preserve if switching to Other
      otherDraft: otherActive ? context.ui.otherDraft : '',
      error: null,
    },
  };
});

const enterOtherText = assign<AssessmentContext, AssessmentEvent>((context, event) => {
  if (event.type !== 'ENTER_OTHER_TEXT') {
    return {};
  }

  if (context.ui.selectedOption !== OTHER_BUTTON) {
    return {};
  }

  const sanitized = sanitizeOtherInput(event.text);
  return {
    ui: {
      ...context.ui,
      otherDraft: sanitized,
    },
  };
});

const commitQP1Answer = assign<AssessmentContext, AssessmentEvent>((context) => {
  const { selectedOption, otherDraft } = context.ui;
  const trimmed = trimToValidationWindow(otherDraft);

  return {
    answers: {
      ...context.answers,
      // Store either the selected option (1-6) or mark as Other (7) with custom text
      qp1Selection: isStandardOption(selectedOption) ? selectedOption : undefined,
      qp1Other: selectedOption === OTHER_BUTTON ? trimmed : undefined,
    },
    session: {
      ...context.session,
      stepIndex: 1, // Move to next step
    },
    ui: {
      ...context.ui,
      // Clear selection state for next question
      selectedOption: null,
      otherActive: false,
      otherDraft: '',
      error: null,
    },
  };
});

const commitQP2Answer = assign<AssessmentContext, AssessmentEvent>((context) => {
  const { selectedOption, otherDraft } = context.ui;
  const trimmed = trimToValidationWindow(otherDraft);

  return {
    answers: {
      ...context.answers,
      qp2Selection: isStandardOption(selectedOption) ? selectedOption : undefined,
      qp2Other: selectedOption === OTHER_BUTTON ? trimmed : undefined,
    },
    session: {
      ...context.session,
      stepIndex: 2,
    },
    ui: {
      ...context.ui,
      selectedOption: null,
      otherActive: false,
      otherDraft: '',
      error: null,
    },
  };
});

const commitQP3Answer = assign<AssessmentContext, AssessmentEvent>((context) => {
  const { selectedOption, otherDraft } = context.ui;
  const trimmed = trimToValidationWindow(otherDraft);

  return {
    answers: {
      ...context.answers,
      qp3Selection: isStandardOption(selectedOption) ? selectedOption : undefined,
      qp3Other: selectedOption === OTHER_BUTTON ? trimmed : undefined,
    },
    session: {
      ...context.session,
      stepIndex: 3, // Move to AI questions phase
    },
    ui: {
      ...context.ui,
      selectedOption: null,
      otherActive: false,
      otherDraft: '',
      error: null,
      isLoading: true, // Trigger AI question generation
    },
  };
});

const rewindToStep = (stepIndex: number) =>
  assign<AssessmentContext, AssessmentEvent>((context) => ({
    session: {
      ...context.session,
      stepIndex,
    },
    ui: {
      ...context.ui,
      error: null,
      isLoading: false,
    },
  }));

const setPhase = (phase: Phase) =>
  assign<AssessmentContext, AssessmentEvent>((context) => ({
    ui: {
      ...context.ui,
      phase,
      error: null,
    },
  }));

const loadQPAnswer = (
  selectionKey: keyof Pick<AnswersState, 'qp1Selection' | 'qp2Selection' | 'qp3Selection'>,
  otherKey: keyof Pick<AnswersState, 'qp1Other' | 'qp2Other' | 'qp3Other'>,
) =>
  assign<AssessmentContext, AssessmentEvent>((context) => {
    const selection = context.answers[selectionKey];
    const other = context.answers[otherKey];

    const selectedOption: OptionId | null = typeof selection === 'number'
      ? (selection as OptionId)
      : other
        ? OTHER_BUTTON
        : null;

    return {
      ui: {
        ...context.ui,
        selectedOption,
        otherActive: selectedOption === OTHER_BUTTON,
        otherDraft: selectedOption === OTHER_BUTTON && other ? other : '',
      },
    };
  });

const storeAIQuestions = assign<AssessmentContext, AssessmentEvent>((context, event) => {
  if (event.type !== 'AI_QUESTIONS_READY') {
    return {};
  }

  return {
    ai: {
      ...context.ai,
      questions: event.questions,
    },
    ui: {
      ...context.ui,
      isLoading: false,
      error: null,
    },
  };
});

const storeNarrative = assign<AssessmentContext, AssessmentEvent>((context, event) => {
  if (event.type !== 'NARRATIVE_READY') {
    return {};
  }

  return {
    ai: {
      ...context.ai,
      narrative: event.narrative,
    },
    session: {
      ...context.session,
      stepIndex: 7,
    },
    ui: {
      ...context.ui,
      isLoading: false,
      error: null,
    },
  };
});

const captureError = assign<AssessmentContext, AssessmentEvent>((context, event) => {
  if (event.type !== 'ERROR') {
    return {};
  }

  return {
    ui: {
      ...context.ui,
      error: event.message,
      isLoading: false,
    },
  };
});

const clearNarrativeAndQuestions = assign<AssessmentContext, AssessmentEvent>((context) => ({
  ai: {
    ...context.ai,
    questions: [],
    narrative: null,
  },
}));

const resetContext = assign<AssessmentContext, AssessmentEvent>(() => createInitialContext());

const canConfirm = (context: AssessmentContext): boolean => {
  const { selectedOption, otherDraft } = context.ui;
  if (isStandardOption(selectedOption)) {
    return true;
  }
  if (selectedOption === OTHER_BUTTON) {
    return hasValidOtherDraft(otherDraft);
  }
  return false;
};

export const assessmentMachine = createMachine<AssessmentContext, AssessmentEvent>(
  {
    id: 'assessmentFlow',
    initial: 'QP1',
    context: createInitialContext(),
    on: {
      RESET: {
        target: 'QP1',
        actions: [resetContext, clearNarrativeAndQuestions],
      },
      ERROR: {
        actions: captureError,
      },
    },
    states: {
      QP1: {
        entry: [setPhase('QP1'), loadQPAnswer('qp1Selection', 'qp1Other')],
        on: {
          SELECT_OPTION: {
            actions: selectOption,
          },
          ENTER_OTHER_TEXT: {
            actions: enterOtherText,
          },
          CONFIRM: {
            target: 'QP2',
            actions: commitQP1Answer,
            cond: 'canConfirm',
          },
        },
      },
      QP2: {
        entry: [setPhase('QP2'), loadQPAnswer('qp2Selection', 'qp2Other')],
        on: {
          SELECT_OPTION: {
            actions: selectOption,
          },
          ENTER_OTHER_TEXT: {
            actions: enterOtherText,
          },
          CONFIRM: {
            target: 'QP3',
            actions: commitQP2Answer,
            cond: 'canConfirm',
          },
          BACK: {
            target: 'QP1',
            actions: rewindToStep(0),
          },
        },
      },
      QP3: {
        entry: [setPhase('QP3'), loadQPAnswer('qp3Selection', 'qp3Other')],
        on: {
          SELECT_OPTION: {
            actions: selectOption,
          },
          ENTER_OTHER_TEXT: {
            actions: enterOtherText,
          },
          CONFIRM: {
            target: 'AI_QUESTIONS',
            actions: [commitQP3Answer, clearNarrativeAndQuestions],
            cond: 'canConfirm',
          },
          BACK: {
            target: 'QP2',
            actions: rewindToStep(1),
          },
        },
      },
      AI_QUESTIONS: {
        entry: [setPhase('AI_QUESTIONS')],
        on: {
          AI_QUESTIONS_READY: {
            actions: storeAIQuestions,
          },
          NARRATIVE_READY: {
            target: 'REPORT',
            actions: storeNarrative,
          },
          BACK: {
            target: 'QP3',
            actions: rewindToStep(2),
          },
        },
      },
      REPORT: {
        entry: [setPhase('REPORT')],
        on: {
          BACK: {
            target: 'AI_QUESTIONS',
            actions: rewindToStep(3),
          },
        },
      },
    },
  },
  {
    guards: {
      canConfirm,
    },
  },
);

type PreliminaryDigit = OptionId | null;

export const getPreliminaryDigits = (context: AssessmentContext): PreliminaryDigit[] => [
  mapAnswerToDigit(context.answers.qp1Selection, context.answers.qp1Other),
  mapAnswerToDigit(context.answers.qp2Selection, context.answers.qp2Other),
  mapAnswerToDigit(context.answers.qp3Selection, context.answers.qp3Other),
];

export const getSelectedDigit = (context: AssessmentContext): PreliminaryDigit =>
  context.ui.selectedOption ?? null;
