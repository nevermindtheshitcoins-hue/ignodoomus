import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { interpret, InterpreterFrom, StateFrom } from 'xstate';

import preliminaryQuestionsData from '../flow/preliminary-questions.yaml';
import {
  AIQuestion,
  AnswersState,
  assessmentMachine,
  AssessmentContext,
  AssessmentEvent,
  OptionId,
} from '../app/StateMachine';
import type { PreliminaryQuestions } from '../domain/types';
import {
  selectActiveStep,
  selectFooterView,
  selectHeaderView,
  selectKeypadView,
  selectScreenView,
  FooterViewModel,
  HeaderBulbModel,
  KeypadViewModel,
  ScreenViewModel,
} from './selectors';
import { generateAIQuestionsAPI, generateNarrativeAPI, validateAPIKey } from './openaiService';
import {
  buildAiPromptContext,
  buildIndustryMockQuestions,
  buildMockNarrative,
  buildResolvedAnswers,
  normaliseOptions,
  summariseAnswers,
} from './mockContent';

export type AssessmentState = StateFrom<typeof assessmentMachine>;
type AssessmentService = InterpreterFrom<typeof assessmentMachine>;

type GenerateAIQuestionsInput = Pick<
  AnswersState,
  'qp1Selection' | 'qp1Other' | 'qp2Selection' | 'qp2Other' | 'qp3Selection' | 'qp3Other'
>;

type GenerateNarrativeInput = Pick<
  AnswersState,
  | 'qp1Selection'
  | 'qp1Other'
  | 'qp2Selection'
  | 'qp2Other'
  | 'qp3Selection'
  | 'qp3Other'
  | 'q1Selection'
  | 'q1Other'
  | 'q2Selection'
  | 'q2Other'
  | 'q3Selection'
  | 'q3Other'
  | 'q4Selection'
  | 'q4Other'
  | 'q5Selection'
  | 'q5Other'
>;

export interface AssessmentFlowOptions {
  preliminaryQuestions?: PreliminaryQuestions;
  generateAIQuestions?: (input: GenerateAIQuestionsInput) => Promise<AIQuestion[]>;
  generateNarrative?: (input: GenerateNarrativeInput) => Promise<string>;
  enableOpenAI?: boolean;
}

export interface AssessmentFlowActions {
  selectOption: (option: OptionId) => void;
  enterOtherText: (text: string) => void;
  confirm: () => void;
  back: () => void;
  reset: () => void;
  requestAIQuestions: () => Promise<void>;
  requestNarrative: () => Promise<void>;
}

export interface AssessmentFlowView {
  header: HeaderBulbModel[];
  screen: ScreenViewModel;
  keypad: KeypadViewModel;
  footer: FooterViewModel;
  step: ReturnType<typeof selectActiveStep>;
  state: AssessmentState;
  context: AssessmentContext;
  actions: AssessmentFlowActions;
}

const defaultPreliminaryQuestions = preliminaryQuestionsData as PreliminaryQuestions;

const buildAIQuestionsInput = (answers: AnswersState): GenerateAIQuestionsInput => ({
  qp1Selection: answers.qp1Selection,
  qp1Other: answers.qp1Other,
  qp2Selection: answers.qp2Selection,
  qp2Other: answers.qp2Other,
  qp3Selection: answers.qp3Selection,
  qp3Other: answers.qp3Other,
});

const buildNarrativeInput = (answers: AnswersState): GenerateNarrativeInput => ({
  qp1Selection: answers.qp1Selection,
  qp1Other: answers.qp1Other,
  qp2Selection: answers.qp2Selection,
  qp2Other: answers.qp2Other,
  qp3Selection: answers.qp3Selection,
  qp3Other: answers.qp3Other,
  q1Selection: answers.q1Selection,
  q1Other: answers.q1Other,
  q2Selection: answers.q2Selection,
  q2Other: answers.q2Other,
  q3Selection: answers.q3Selection,
  q3Other: answers.q3Other,
  q4Selection: answers.q4Selection,
  q4Other: answers.q4Other,
  q5Selection: answers.q5Selection,
  q5Other: answers.q5Other,
});

const makeMockQuestions = (
  context: AssessmentContext,
  preliminary: PreliminaryQuestions,
): AIQuestion[] => {
  const resolved = buildResolvedAnswers(context.answers, preliminary);
  const generated = buildIndustryMockQuestions(resolved);

  return generated.map((question, index) => ({
    ...question,
    id: `qai${index + 1}`,
    source: context.ai.questions[index]?.source ?? question.source,
  }));
};

const makeMockNarrative = (
  context: AssessmentContext,
  preliminary: PreliminaryQuestions,
): string => {
  const resolved = buildResolvedAnswers(context.answers, preliminary);
  return buildMockNarrative(resolved);
};

const normaliseOpenAIOptions = (options: string[] | undefined): string[] =>
  normaliseOptions(options ?? [], 6);

const buildNarrativeSummary = (
  context: AssessmentContext,
  preliminary: PreliminaryQuestions,
): string => summariseAnswers(context.answers, preliminary, context.ai.questions);

const defaultQuestionId = (index: number): string => `qai${index + 1}`;

export const useAssessmentFlow = (options?: AssessmentFlowOptions): AssessmentFlowView => {
  const preliminaryQuestions = options?.preliminaryQuestions ?? defaultPreliminaryQuestions;
  const generateAIQuestions = options?.generateAIQuestions;
  const generateNarrative = options?.generateNarrative;
  const enableOpenAI = options?.enableOpenAI;

  const openAIEnabled = useMemo(() => {
    if (generateAIQuestions || generateNarrative) {
      return false;
    }
    if (typeof enableOpenAI === 'boolean') {
      return enableOpenAI && validateAPIKey();
    }
    return validateAPIKey();
  }, [enableOpenAI, generateAIQuestions, generateNarrative]);

  const callOpenAIQuestions = useCallback(
    async (context: AssessmentContext) => {
      const resolved = buildResolvedAnswers(context.answers, preliminaryQuestions);
      const promptContext = buildAiPromptContext(resolved);
      const response = await generateAIQuestionsAPI(
        promptContext.industry,
        promptContext.goal,
        promptContext.pain,
      );

      return response.map((item, index) => ({
        id: item.id ?? defaultQuestionId(index),
        text: (item.text ?? '').trim(),
        options: normaliseOpenAIOptions(item.options),
        source: 'ai' as const,
      }));
    },
    [preliminaryQuestions],
  );

  const callOpenAINarrative = useCallback(
    async (context: AssessmentContext) => {
      const resolved = buildResolvedAnswers(context.answers, preliminaryQuestions);
      const promptContext = buildAiPromptContext(resolved);
      const summary = buildNarrativeSummary(context, preliminaryQuestions);
      return generateNarrativeAPI(
        promptContext.industry,
        promptContext.goal,
        promptContext.pain,
        summary,
      );
    },
    [preliminaryQuestions],
  );

  const serviceRef = useRef<AssessmentService | null>(null);
  const [currentState, setCurrentState] = useState<AssessmentState>(() =>
    assessmentMachine.initialState,
  );

  useEffect(() => {
    const service = interpret(assessmentMachine);
    serviceRef.current = service;
    setCurrentState(service.initialState);

    const subscription = service.subscribe((next) => {
      if (next.changed === false) {
        return;
      }
      setCurrentState(next);
    });

    service.start();
    return () => {
      subscription.unsubscribe();
      service.stop();
      serviceRef.current = null;
    };
  }, []);

  const header = useMemo(() => selectHeaderView(currentState.context), [currentState.context]);
  const screen = useMemo(
    () => selectScreenView(currentState.context, preliminaryQuestions),
    [currentState.context, preliminaryQuestions],
  );
  const keypad = useMemo(() => selectKeypadView(currentState.context, screen), [
    currentState.context,
    screen,
  ]);
  const footer = useMemo(() => selectFooterView(currentState.context), [currentState.context]);
  const step = useMemo(() => selectActiveStep(currentState.context), [currentState.context]);

  const selectOption = useCallback((option: OptionId) => {
    serviceRef.current?.send({ type: 'SELECT_OPTION', option });
  }, []);

  const enterOtherText = useCallback((text: string) => {
    serviceRef.current?.send({ type: 'ENTER_OTHER_TEXT', text });
  }, []);

  const confirm = useCallback(() => {
    serviceRef.current?.send({ type: 'CONFIRM' });
  }, []);

  const back = useCallback(() => {
    serviceRef.current?.send({ type: 'BACK' });
  }, []);

  const reset = useCallback(() => {
    serviceRef.current?.send({ type: 'RESET' });
  }, []);

  const requestAIQuestions = useCallback(async () => {
    const service = serviceRef.current;
    if (!service) return;
    const snapshot = service.getSnapshot();
    if (snapshot.context.ui.phase !== 'AI_QUESTIONS' || snapshot.context.ai.questions.length > 0) {
      return;
    }
    
    try {
      const shouldUseOpenAI = openAIEnabled && !generateAIQuestions;
      const questions = generateAIQuestions
        ? await generateAIQuestions(buildAIQuestionsInput(snapshot.context.answers))
        : shouldUseOpenAI
            ? await callOpenAIQuestions(snapshot.context)
            : makeMockQuestions(snapshot.context, preliminaryQuestions);
      service.send({ type: 'AI_QUESTIONS_READY', questions });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to generate AI questions right now.';
      service.send({ type: 'ERROR', message });
    }
  }, [callOpenAIQuestions, generateAIQuestions, openAIEnabled, preliminaryQuestions]);

  const requestNarrative = useCallback(async () => {
    const service = serviceRef.current;
    if (!service) return;
    const snapshot = service.getSnapshot();
    if (snapshot.context.ui.phase !== 'REPORT' || snapshot.context.ai.narrative) {
      return;
    }
    
    try {
      const shouldUseOpenAI = openAIEnabled && !generateNarrative;
      const narrative = generateNarrative
        ? await generateNarrative(buildNarrativeInput(snapshot.context.answers))
        : shouldUseOpenAI
            ? await callOpenAINarrative(snapshot.context)
            : makeMockNarrative(snapshot.context, preliminaryQuestions);
      service.send({ type: 'NARRATIVE_READY', narrative });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to assemble the narrative right now.';
      service.send({ type: 'ERROR', message });
    }
  }, [callOpenAINarrative, generateNarrative, openAIEnabled, preliminaryQuestions]);

  useEffect(() => {
    if (
      currentState.context.ui.phase === 'AI_QUESTIONS' &&
      currentState.context.ui.isLoading &&
      currentState.context.ai.questions.length === 0
    ) {
      void requestAIQuestions();
    }
  }, [currentState, requestAIQuestions]);

  useEffect(() => {
    if (
      currentState.context.ui.phase === 'REPORT' &&
      currentState.context.ui.isLoading &&
      !currentState.context.ai.narrative
    ) {
      void requestNarrative();
    }
  }, [currentState, requestNarrative]);

  return {
    header,
    screen,
    keypad,
    footer,
    step,
    state: currentState,
    context: currentState.context,
    actions: {
      selectOption,
      enterOtherText,
      confirm,
      back,
      reset,
      requestAIQuestions,
      requestNarrative,
    },
  };
};
