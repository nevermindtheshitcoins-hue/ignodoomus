import type { AIQuestion, AnswersState, AssessmentContext } from '../app/StateMachine';
import type { PreliminaryQuestions } from '../domain/types';
import {
  INDUSTRY_PROFILES,
  buildIndustryQuestions,
  findIndustryProfile,
  pickProofPoints,
  PROOF_POINTS,
  TemplateContext,
} from '../content/industryProfiles';
import {
  ResolvedPreliminaryAnswers,
  resolvePreliminaryAnswers,
} from './preliminaryAnswers';

interface NarrativeSections {
  summary: string;
  implementation: string[];
  technical: string[];
  outcomes: string[];
  nextSteps: string[];
  proofPoints: string[];
  vessel: string;
  dramaticEngine: string;
}

export const buildResolvedAnswers = (
  answers: AnswersState,
  preliminary: PreliminaryQuestions,
): ResolvedPreliminaryAnswers => resolvePreliminaryAnswers(answers, preliminary);

const fallbackQuestions = (): AIQuestion[] => {
  const options = [
    'Sharpen data feed automation',
    'Expand observer transparency',
    'Codify audit hand-offs',
    'Instrument live KPIs',
    'Document regulator handshakes',
    'Escalate board visibility',
  ];

  return Array.from({ length: 5 }, (_, index) => ({
    id: `qai${index + 1}`,
    text:
      index === 0
        ? 'How does your team currently capture proof for critical decisions?'
        : `What would increase trust in decision ${index + 1}?`,
    options: normaliseOptions(options, 6),
    source: 'mock' as const,
  }));
};

export const normaliseOptions = (options: string[], expectedLength: number): string[] => {
  const cleaned = options
    .map((option) => (option ?? '').toString().trim())
    .filter((option, index) => option.length > 0 || index < expectedLength);

  const next = cleaned.slice(0, expectedLength);
  while (next.length < expectedLength) {
    next.push('');
  }
  return next;
};

export const buildIndustryMockQuestions = (
  resolved: ResolvedPreliminaryAnswers,
): AIQuestion[] => {
  const profile =
    findIndustryProfile(resolved.industry.label) ?? INDUSTRY_PROFILES.find(() => true) ?? null;

  if (!profile) {
    return fallbackQuestions();
  }

  const ctx: TemplateContext = {
    role: resolved.role.label,
    industry: profile.label,
    pain: resolved.pain.label,
  };

  const templates = buildIndustryQuestions(profile, ctx);
  if (!templates.length) {
    return fallbackQuestions();
  }

  return templates.map((item, index) => ({
    id: `qai${index + 1}`,
    text: item.prompt,
    options: normaliseOptions(item.options, 6),
    source: 'mock' as const,
  }));
};

export const buildNarrativeSections = (
  resolved: ResolvedPreliminaryAnswers,
): NarrativeSections => {
  const profile =
    findIndustryProfile(resolved.industry.label) ?? INDUSTRY_PROFILES.find(() => true) ?? null;

  if (!profile) {
    return {
      summary: 'DeVOTE provides verifiable governance so leadership can act with confidence.',
      implementation: [
        'Map current decision workflows and bind each step to a verifiable ledger.',
        'Replace manual approvals with cryptographic attestations that satisfy stakeholders.',
        'Expose dashboards that show trust, compliance, and velocity metrics in real time.',
      ],
      technical: [
        'Zero-knowledge proofs validate results instantly while keeping sensitive inputs private.',
        'Immutable audit trails plug into existing systems of record via lightweight connectors.',
        'Sybil-resistant identity ensures only authorized actors can vote, approve, or attest.',
      ],
      outcomes: [
        'Decision cycles shrink because evidence is assembled continuously.',
        'Stakeholders gain persistent transparency that reduces dispute volume.',
        'Trust becomes a measurable KPI that guides investment and governance priorities.',
      ],
      nextSteps: [
        'Run a focused pilot on a critical decision flow and measure time-to-proof.',
        'Codify governance playbooks inside DeVOTE and publish transparency dashboards.',
        'Scale to additional teams once trust and velocity gains are evidenced.',
      ],
      proofPoints: ['ZK-Verified Tally', 'Immutable Audit Trail', 'Sybil-Resistant Identity'],
      vessel: 'Internal Strategic Report',
      dramaticEngine: 'Opportunity Seized',
    };
  }

  const ctx: TemplateContext = {
    role: resolved.role.label,
    industry: profile.label,
    pain: resolved.pain.label,
  };

  const proofPointIds = pickProofPoints(profile, resolved.pain.label);
  const proofPoints = proofPointIds.map((id) => PROOF_POINTS[id].title);

  return {
    summary: profile.narrative.summary(ctx),
    implementation: profile.narrative.implementation(ctx),
    technical: profile.narrative.technical(ctx),
    outcomes: profile.narrative.outcomes(ctx),
    nextSteps: profile.narrative.nextSteps,
    proofPoints,
    vessel: profile.narrative.vessel,
    dramaticEngine: profile.narrative.dramaticEngine,
  };
};

const renderSectionList = (heading: string, items: string[]): string[] => {
  if (!items.length) {
    return [];
  }
  return [heading, ...items.map((item) => `- ${item}`), ''];
};

export const buildAiPromptContext = (resolved: ResolvedPreliminaryAnswers) => {
  const profile = findIndustryProfile(resolved.industry.label);
  const goal = profile?.defaultGoal ?? `strengthen trust across ${resolved.industry.label}`;

  return {
    industry: resolved.industry.label,
    goal,
    pain: resolved.pain.label,
  };
};

const AI_SELECTION_KEYS: Array<keyof AnswersState> = [
  'q1Selection',
  'q2Selection',
  'q3Selection',
  'q4Selection',
  'q5Selection',
];

const AI_OTHER_KEYS: Array<keyof AnswersState> = [
  'q1Other',
  'q2Other',
  'q3Other',
  'q4Other',
  'q5Other',
];

const resolveAiAnswer = (
  answers: AnswersState,
  question: AIQuestion | undefined,
  index: number,
): string => {
  const selection = answers[AI_SELECTION_KEYS[index]] as number | undefined;
  const other = answers[AI_OTHER_KEYS[index]] as string | undefined;

  if (other && other.trim().length > 0) {
    return other.trim();
  }

  if (typeof selection === 'number') {
    const label = question?.options?.[selection - 1]?.trim();
    if (label && label.length > 0) {
      return label;
    }
    return `Selected option ${selection}`;
  }

  return 'No response yet';
};

export const summariseAnswers = (
  answers: AnswersState,
  preliminary: PreliminaryQuestions,
  aiQuestions?: AIQuestion[],
): string => {
  const resolved = resolvePreliminaryAnswers(answers, preliminary);
  const lines: string[] = [
    `Role: ${resolved.role.label}`,
    `Industry: ${resolved.industry.label}`,
    `Primary Pain: ${resolved.pain.label}`,
  ];

  if (aiQuestions && aiQuestions.length > 0) {
    lines.push('');
    aiQuestions.forEach((question, index) => {
      const answer = resolveAiAnswer(answers, question, index);
      lines.push(`${question.id ?? `Qai${index + 1}`}: ${question.text} => ${answer}`);
    });
  }

  return lines.join('\n');
};

export const buildMockNarrative = (
  resolved: ResolvedPreliminaryAnswers,
): string => {
  const sections = buildNarrativeSections(resolved);

  const lines: string[] = [];
  lines.push(`# ${sections.vessel}: ${resolved.industry.label}`);
  lines.push('');
  lines.push('## Executive Summary');
  lines.push(sections.summary);
  lines.push('');

  lines.push(...renderSectionList('## Strategic Implementation', sections.implementation));
  lines.push(...renderSectionList('## Technical Architecture', sections.technical));
  lines.push(...renderSectionList('## Expected Outcomes', sections.outcomes));

  if (sections.proofPoints.length) {
    lines.push('## Proof Points That Anchor Trust');
    lines.push(...sections.proofPoints.map((point) => `- ${point}`));
    lines.push('');
  }

  lines.push(...renderSectionList('## Next Steps', sections.nextSteps));
  lines.push(`*Narrative engine: ${sections.dramaticEngine}.*`);

  return lines.join('\n');
};
