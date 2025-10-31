export interface TemplateContext {
  role: string;
  industry: string;
  pain: string;
}

export interface IndustryQuestion {
  prompt: string;
  options: string[];
}

export interface NarrativeTemplate {
  vessel: 'Investor Memo' | 'Case Study' | 'Internal Strategic Report' | 'Regulatory Submission';
  dramaticEngine: 'Crisis Averted' | 'Opportunity Seized' | 'Legacy Transformed';
  summary: (ctx: TemplateContext) => string;
  implementation: (ctx: TemplateContext) => string[];
  technical: (ctx: TemplateContext) => string[];
  outcomes: (ctx: TemplateContext) => string[];
  nextSteps: string[];
}

export interface IndustryProfile {
  id: string;
  label: string;
  aliases: string[];
  defaultGoal: string;
  proofPoints: ProofPointId[];
  questions: Array<(ctx: TemplateContext) => IndustryQuestion>;
  narrative: NarrativeTemplate;
}

export type ProofPointId = 'zkProofs' | 'immutableAuditTrail' | 'sybilIdentity' | 'costPerTrust';

export interface ProofPoint {
  id: ProofPointId;
  title: string;
  hook: string;
  benefit: string;
}

export const PROOF_POINTS: Record<ProofPointId, ProofPoint> = {
  zkProofs: {
    id: 'zkProofs',
    title: 'ZK-Verified Tally',
    hook: 'Confirms results in under three seconds without exposing individual choices.',
    benefit: 'Delivers instant assurance to stakeholders while preserving ballot secrecy.',
  },
  immutableAuditTrail: {
    id: 'immutableAuditTrail',
    title: 'Immutable Audit Trail',
    hook: 'Produces tamper-evident records regulators can rely on immediately.',
    benefit: 'Eliminates dispute cycles and compresses audit turnaround times from weeks to minutes.',
  },
  sybilIdentity: {
    id: 'sybilIdentity',
    title: 'Sybil-Resistant Identity',
    hook: 'Prevents duplicate or impersonated votes without collecting personal data.',
    benefit: 'Protects decision integrity across distributed teams and external collaborators.',
  },
  costPerTrust: {
    id: 'costPerTrust',
    title: 'Cost-Per-Trust Metric',
    hook: 'Reduces dispute resolution and verification spend by up to 92%.',
    benefit: 'Turns governance into a measurable ROI driver instead of a compliance expense.',
  },
};

const sentence = (text: string): string => text.trim().replace(/\s+/g, ' ');

const withPain = (base: string, ctx: TemplateContext): string =>
  sentence(base.replace('{PAIN}', ctx.pain.toLowerCase()));

const withIndustry = (base: string, ctx: TemplateContext): string =>
  sentence(base.replace('{INDUSTRY}', ctx.industry));

const q = (prompt: string, options: string[]) => (ctx: TemplateContext): IndustryQuestion => ({
  prompt: sentence(prompt.replace('{PAIN}', ctx.pain.toLowerCase()).replace('{ROLE}', ctx.role).replace('{INDUSTRY}', ctx.industry)),
  options: options.map((option) =>
    sentence(option
      .replace('{PAIN}', ctx.pain.toLowerCase())
      .replace('{ROLE}', ctx.role)
      .replace('{INDUSTRY}', ctx.industry),
    ),
  ),
});

const makeNarrative = (
  vessel: NarrativeTemplate['vessel'],
  dramaticEngine: NarrativeTemplate['dramaticEngine'],
  summary: (ctx: TemplateContext) => string,
  implementation: (ctx: TemplateContext) => string[],
  technical: (ctx: TemplateContext) => string[],
  outcomes: (ctx: TemplateContext) => string[],
  nextSteps: string[],
): NarrativeTemplate => ({ vessel, dramaticEngine, summary, implementation, technical, outcomes, nextSteps });

export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    id: 'corporate-governance',
    label: 'Corporate Governance & Board Decisions',
    aliases: ['Corporate Governance', 'Board Decisions'],
    defaultGoal: 'accelerate confident board-level outcomes',
    proofPoints: ['immutableAuditTrail', 'zkProofs', 'costPerTrust'],
    questions: [
      q(
        'Where does your board struggle most to present verifiable evidence today?',
        [
          'Pre-read packs rarely show the provenance of data cited in decisions',
          'Minutes and resolutions are stored in places auditors cannot access quickly',
          'Committee updates arrive without proof that delegated actions were completed',
          'Shareholder communications cite metrics that cannot be traced back to source systems',
          'Interim approvals happen over email with no immutable record',
          'We do not have a single system of record for board votes and outcomes',
        ],
      ),
      q(
        'How are sensitive votes currently executed across your governance structure?',
        [
          'Formal meetings with paper ballots or hand counts',
          'Email surveys with manual tallying after the meeting',
          'Video conferences with verbal roll calls',
          'Delegated committees make the decision and simply report outcomes',
          'Directors send their vote to the chair or secretary individually',
          'We rely on a legacy board portal with limited verification features',
        ],
      ),
      q(
        'Which stakeholder demands are putting the most pressure on your governance cadence?',
        [
          'Regulators expect auditable controls around every strategic vote',
          'Investors want line-of-sight into how quickly decisions become actions',
          'Employees want clarity on how leadership decisions impact their work',
          'Community or ESG stakeholders expect transparent reporting',
          'Partners need proof that delegated authority is being exercised responsibly',
          'The board itself wants faster reconciliation of outcomes vs. commitments',
        ],
      ),
      q(
        'How do you currently reconcile decisions taken between formal board sessions?',
        [
          'Ad-hoc approvals via email or chat with no shared ledger',
          'Special committees meet, but documentation lags by weeks',
          'Interim votes happen, yet final documentation is recreated after the fact',
          'Off-cycle resolutions are logged in spreadsheets with limited access control',
          'Executive teams brief the board verbally with no digital trail',
          'Directors rely on personal notes to remember rationale and actions',
        ],
      ),
      q(
        'What transformation would create the biggest win for {INDUSTRY} governance this quarter?',
        [
          'Real-time quorum tracking and decision proofs the moment votes close',
          'Automated resolution distribution to investors and regulators',
          'End-to-end digital audit packs for every board and committee decision',
          'Delegated authority logs that link actions to accountable owners',
          'Predictive alerts when governance bottlenecks risk board promises',
          'Dynamic dashboards that quantify trust and compliance improvements',
        ],
      ),
    ],
    narrative: makeNarrative(
      'Internal Strategic Report',
      'Opportunity Seized',
      (ctx) =>
        sentence(
          `${ctx.role} within ${ctx.industry} is under pressure to turn governance from a ${ctx.pain.toLowerCase()} headache into a strategic differentiator. DeVOTE delivers end-to-end verification so every resolution is backed by mathematical proof.`,
        ),
      (ctx) => [
        withIndustry('Stand up verifiable voting for every {INDUSTRY} board and committee decision.', ctx),
        withPain('Connect resolution workflows to zero-knowledge verification that neutralizes {PAIN}.', ctx),
        'Automate investor and regulator reporting with immutable audit packets issued minutes after each vote.',
        'Instrument a trust scoreboard that shows directors how fast commitments become accountable actions.',
      ],
      () => [
        'DeVOTE Ledger anchors board, committee, and delegated votes with zk-proof backed verification.',
        'Role-based access and sybil-resistant identity enforce who can propose, debate, and decide.',
        'API connectors sync artefacts to existing board portals, DMS, and compliance archives without migration.',
      ],
      (ctx) => [
        'Board resolutions move from draft to verifiable action in under 48 hours.',
        sentence(`Stakeholders see a living audit log instead of retroactive minutes, restoring confidence despite ${ctx.pain.toLowerCase()}.`),
        'Directors spend meeting time on strategy, not reconciling what was approved vs. executed.',
      ],
      [
        'Launch a pilot with one board committee and measure time-to-proof for key resolutions.',
        'Codify governance playbooks in DeVOTE so delegated authority is transparent and enforceable.',
        'Roll out immutable resolution packets to investors, regulators, and operations teams.',
        'Expand metrics dashboards to quantify trust, compliance, and execution velocity.',
      ],
    ),
  },
  {
    id: 'healthcare-clinical',
    label: 'Healthcare & Clinical Research',
    aliases: ['Healthcare', 'Clinical Research'],
    defaultGoal: 'protect trial integrity while accelerating approvals',
    proofPoints: ['zkProofs', 'sybilIdentity', 'immutableAuditTrail'],
    questions: [
      q(
        'Which part of your research lifecycle most urgently needs verifiable governance?',
        [
          'Protocol amendments and investigator approvals',
          'Patient consent capture and revocation tracking',
          'Data access requests across partner institutions',
          'Safety signal adjudication committees',
          'Institutional Review Board (IRB) decisions',
          'Funding disbursements tied to milestone completion',
        ],
      ),
      q(
        'How do collaborators currently attest to compliance duties?',
        [
          'Manual email trails stored in shared drives',
          'eSignature tools with no link to source data',
          'Clinical trial management system notes with limited auditability',
          'Weekly checkpoints documented in slide decks',
          'Risk logs updated retroactively during monitoring visits',
          'Regulator-facing updates typed into static PDFs',
        ],
      ),
      q(
        'Where would zero-knowledge verification neutralize stakeholder skepticism?',
        [
          'Proving randomization logic without exposing patient cohorts',
          'Showing regulators that consent withdrawals propagate instantly',
          'Demonstrating supply-chain custody for temperature-sensitive therapies',
          'Validating investigator conflicts of interest have been cleared',
          'Confirming that data queries are addressed within required SLAs',
          'Reassuring sponsors that outsourced sites follow approved protocols',
        ],
      ),
      q(
        'What scenario causes the most painful delays when evidence is challenged?',
        [
          'Safety boards pausing enrollment until documentation is reconciled',
          'Regulators asking for provenance on data transformations',
          'Sponsors disputing whether milestone criteria were truly met',
          'Site monitors escalating inconsistent consent statuses',
          'Investigators contesting committee vote outcomes',
          'Partners questioning access controls for shared datasets',
        ],
      ),
      q(
        'If you could automate one trust-building signal for {INDUSTRY}, what would it measure?',
        [
          'Proof that every protocol deviation triggered required review',
          'Immutable chain-of-custody for trial data sets',
          'Real-time enrollment stats signed by authorized investigators',
          'Transparent adjudication logs for adverse events',
          'Sponsor dashboards showing compliance KPIs by site',
          'Time-to-proof for regulatory submissions and amendments',
        ],
      ),
    ],
    narrative: makeNarrative(
      'Regulatory Submission',
      'Crisis Averted',
      (ctx) =>
        sentence(
          `${ctx.industry} teams are facing scrutiny around data integrity and investigator accountability. DeVOTE proves every action in the research lifecycle without exposing sensitive patient information.`,
        ),
      (ctx) => [
        'Instrument protocol governance so approvals, deviations, and closures carry instant mathematical proof.',
        withPain('Replace manual attestations with zk-backed workflows that eliminate {PAIN}.', ctx),
        'Connect investigator actions, patient consent, and regulatory reporting to a shared audit fabric.',
        'Provide sponsors and regulators with dashboards that surface trust metrics in real time.',
      ],
      () => [
        'Zero-knowledge proofs confirm trial events while preserving blinding and PHI confidentiality.',
        'Sybil-resistant identity ensures investigators, CROs, and regulators only act within their mandate.',
        'Immutable ledgers plug into CTMS, eConsent, and safety monitoring tools through lightweight adapters.',
      ],
      (ctx) => [
        'Audit cycles shrink from months to days because evidence is assembled continuously.',
        sentence(`${ctx.role} can demonstrate uncompromising integrity even under emergency regulatory reviews.`),
        'Enrollment and protocol change approvals accelerate because trust objections disappear.',
      ],
      [
        'Select a high-visibility study and bind protocol decisions to DeVOTE verification.',
        'Automate consent, deviation, and safety signal attestations with cryptographic proofs.',
        'Expose regulator/sponsor dashboards that display live trust and compliance metrics.',
        'Scale to remaining trials once cycle-time reductions are quantified.',
      ],
    ),
  },
  {
    id: 'education-research',
    label: 'Education & Academic Research',
    aliases: ['Education', 'Academic Research'],
    defaultGoal: 'strengthen academic integrity across distributed collaborators',
    proofPoints: ['sybilIdentity', 'immutableAuditTrail', 'zkProofs'],
    questions: [
      q(
        'Where does academic governance most often break down?',
        [
          'Grant committees struggling to defend awarding decisions',
          'Ethics boards managing conflicts of interest disclosures',
          'Curriculum councils tracking vote history on policy changes',
          'Faculty senate resolutions lacking a single source of truth',
          'Research collaborations needing tamper-evident authorship logs',
          'Student governance bodies managing trusted representation',
        ],
      ),
      q(
        'How are votes and approvals gathered across campuses or partner institutions?',
        [
          'Email or chat threads coordinated by an administrator',
          'Legacy voting tools with limited access control',
          'Synchronous meetings that exclude off-timezone contributors',
          'Polling software without durable audit trails',
          'Paper or in-person balloting with manual transcription',
          'Hybrid processes that vary by department or committee',
        ],
      ),
      q(
        'What assurance do stakeholders need before trusting a decision outcome?',
        [
          'Proof that only eligible faculty participated',
          'Evidence that conflicts of interest were declared and mitigated',
          'Chain-of-custody for research data contributions',
          'Instant publication of vote totals without exposing individual selections',
          'Audit records for accreditation bodies',
          'Real-time visibility for students and partners impacted by decisions',
        ],
      ),
      q(
        'Which governance backlog would you eliminate first if you could automate trust?',
        [
          'Grant awards awaiting multi-department sign-off',
          'Curriculum changes delayed by quorum checks',
          'Research MOUs stalled by compliance reviews',
          'Faculty senate motions looping through manual clarifications',
          'Student representation disputes',
          'Authorship disputes over shared research outputs',
        ],
      ),
      q(
        'How should {INDUSTRY} measure success once trust infrastructure is in place?',
        [
          'Time-to-approval for grants, curriculum, or policy changes',
          'Participation rates across diverse campuses and stakeholders',
          'Audit clearance speed for accreditation and compliance reviews',
          'Transparency scores derived from public decision ledgers',
          'Dispute resolution time related to shared research outputs',
          'Budget savings from replacing manual reconciliation',
        ],
      ),
    ],
    narrative: makeNarrative(
      'Case Study',
      'Legacy Transformed',
      (ctx) =>
        sentence(
          `${ctx.industry} leaders are juggling hybrid campuses, shared grants, and public accountability. DeVOTE modernizes academic governance so every decision and authorship action is provably fair.`,
        ),
      (ctx) => [
        'Replace ad-hoc voting and authorship tracking with verifiable digital ledgers.',
        withPain('Address {PAIN} by binding committee work, resource allocation, and research collaboration to cryptographic proof.', ctx),
        'Enable remote participation without sacrificing eligibility or confidentiality.',
        'Publish transparent outcomes that satisfy faculty, students, and external funders alike.',
      ],
      () => [
        'Sybil-resistant identity confirms eligibility while protecting anonymity for sensitive votes.',
        'Immutable audit trails keep faculty, student, and research decisions in a single verifiable timeline.',
        'Zero-knowledge proofs share totals instantly while shielding individual selections.',
      ],
      (ctx) => [
        sentence(`Policy changes move from debate to adoption weeks faster because ${ctx.role.toLowerCase()} no longer reconciles scattered records.`),
        'Grant, ethics, and curriculum committees hand regulators live access to authenticated decisions.',
        'Students and collaborators trust outcomes because every step is observable and verifiable.',
      ],
      [
        'Digitize a flagship committee or senate process inside DeVOTE.',
        'Roll out verifiable identity for faculty, students, and external reviewers.',
        'Build transparent dashboards that blend governance, funding, and academic integrity signals.',
        'Scale to research consortia once internal adoption is proven.',
      ],
    ),
  },
  {
    id: 'public-sector',
    label: 'Government & Public Sector',
    aliases: ['Government', 'Public Sector'],
    defaultGoal: 'deliver provable transparency to citizens and oversight bodies',
    proofPoints: ['immutableAuditTrail', 'zkProofs', 'sybilIdentity'],
    questions: [
      q(
        'Which civic decision process most needs tamper-proof verification?',
        [
          'Budget appropriations and amendments',
          'Procurement awards and vendor evaluations',
          'Policy consultations and stakeholder ballots',
          'Emergency response authorizations',
          'Inter-agency data sharing agreements',
          'Citizen assemblies or participatory budgeting',
        ],
      ),
      q(
        'Where do transparency commitments currently collide with bureaucratic reality?',
        [
          'Publishing audit-ready records within mandated timeframes',
          'Demonstrating that only eligible officials contributed to a decision',
          'Responding to FOIA or public records requests without redaction errors',
          'Explaining procurement scoring and evaluations to losing bidders',
          'Tracking conditions attached to grants and inter-governmental funding',
          'Coordinating cross-agency approvals without duplication',
        ],
      ),
      q(
        'Which stakeholder group is applying the most pressure for verifiable proof?',
        [
          'Legislative oversight committees',
          'Inspector generals and auditors',
          'Local communities impacted by decisions',
          'Vendors and suppliers seeking fair treatment',
          'Advocacy groups demanding accountability',
          'International partners monitoring compliance benchmarks',
        ],
      ),
      q(
        'What bottleneck keeps leadership from acting quickly when evidence is incomplete?',
        [
          'Manual reconciliation across multiple document repositories',
          'Unclear chain-of-command for emergency authorizations',
          'Fragmented voting processes with no single tally source',
          'Fear of litigation if documentation is inconsistent',
          'Difficulty proving citizen feedback was considered',
          'Data-sharing friction between agencies or jurisdictions',
        ],
      ),
      q(
        'If you could publish one trust signal for {INDUSTRY} each week, what would reassure citizens most?',
        [
          'Immutable ledger of how funds were allocated vs. authorized',
          'Proof that procurement scoring matched published criteria',
          'Citizen dashboards showing how public input changed policy wording',
          'Real-time status of compliance tasks tied to legislation',
          'Cross-agency agreement tracker with cryptographic signatures',
          'KPIs showing dispute resolution time dropping quarter-over-quarter',
        ],
      ),
    ],
    narrative: makeNarrative(
      'Internal Strategic Report',
      'Crisis Averted',
      (ctx) =>
        sentence(
          `${ctx.industry} leaders face a trust deficit amplified by ${ctx.pain.toLowerCase()}. DeVOTE replaces fragmented records with verifiable transparency, so scrutiny becomes an asset rather than a liability.`,
        ),
      (ctx) => [
        'Anchor budget, procurement, and policy workflows in zero-knowledge verification.',
        'Give auditors, oversight boards, and citizens a single, tamper-proof audit trail.',
        withPain('Neutralize {PAIN} by proving chain-of-command and eligibility without slowing action.', ctx),
        'Automate weekly transparency briefings that show outcomes and proof side by side.',
      ],
      () => [
        'Cryptographic attestations capture every approval, amendment, and transfer of authority.',
        'Fine-grained access control keeps sensitive information private while publishing the proof.',
        'APIs sync with budgeting, procurement, and case management systems to avoid double entry.',
      ],
      (ctx) => [
        'Oversight bodies close findings faster because evidence is real-time.',
        sentence(`Citizens regain confidence knowing ${ctx.role.toLowerCase()} can present proof without delay.`),
        'Programs scale across agencies because the trust model is standardized.',
      ],
      [
        'Select a flagship procurement or budgeting process to serve as the transparency pilot.',
        'Integrate DeVOTE proofs with existing public reporting portals.',
        'Train inspectors and auditors to rely on cryptographic evidence instead of manual sampling.',
        'Expand to emergency response and inter-agency agreements once trust metrics rise.',
      ],
    ),
  },
  {
    id: 'supply-chain',
    label: 'Supply Chain & Regulatory Compliance',
    aliases: ['Supply Chain', 'Regulatory Compliance'],
    defaultGoal: 'prove chain-of-custody and compliance without slowing throughput',
    proofPoints: ['immutableAuditTrail', 'sybilIdentity', 'costPerTrust'],
    questions: [
      q(
        'Where is chain-of-custody visibility weakest today?',
        [
          'Supplier onboarding and due diligence attestations',
          'Batch release approvals across manufacturing partners',
          'Logistics hand-offs between carriers or regions',
          'Quality control escalations and deviation management',
          'Regulatory filings tied to product movement',
          'Warranty or recall coordination across downstream partners',
        ],
      ),
      q(
        'Which compliance regimes create the most repetitive audit work?',
        [
          'FDA / EMA pharmaceutical regulations',
          'Customs and import/export controls',
          'Environmental, social, and governance reporting',
          'Critical infrastructure or defense-grade compliance',
          'ISO or industry-specific quality certifications',
          'Regional data residency and privacy obligations',
        ],
      ),
      q(
        'What evidence do customers or regulators struggle to verify quickly?',
        [
          'Origin tracing for ethically sourced materials',
          'Temperature control logs for cold-chain products',
          'Proof that subcontractors followed restricted process steps',
          'Authentication of digital identities involved in releases',
          'Remediation follow-up after an inspection finding',
          'Lifecycle documentation for safety-critical components',
        ],
      ),
      q(
        'When {PAIN} strikes, which team scrambles the most?',
        [
          'Quality and compliance managers chasing paper signatures',
          'Operations leaders re-validating partner attestations',
          'Regulatory affairs assembling audit packets under deadline',
          'Customer success explaining delays without sufficient data',
          'Finance modelling liability exposure without trustworthy signals',
          'Legal preparing disclosures with incomplete documentation',
        ],
      ),
      q(
        'What proof signal would transform partner and regulator confidence overnight?',
        [
          'Immutable release certificates attached to every batch or shipment',
          'Real-time compliance dashboards showing zero outstanding deviations',
          'Supplier scorecards grounded in cryptographically signed attestations',
          'Dispute resolution timelines compressed by automated evidence packs',
          'Customer-facing provenance portals with selective disclosure',
          'Predictive alerts when trust or compliance metrics fall below threshold',
        ],
      ),
    ],
    narrative: makeNarrative(
      'Case Study',
      'Opportunity Seized',
      (ctx) =>
        sentence(
          `${ctx.industry} networks win when partners can verify every hand-off. DeVOTE injects proof into supply chain decisions so compliance stops slowing fulfillment.`,
        ),
      (ctx) => [
        'Bind onboarding, production, logistics, and remediation workflows to a shared trust ledger.',
        withPain('Convert {PAIN} from a manual scramble into an automated alert and resolution cycle.', ctx),
        'Expose regulators and customers to the same authenticated evidence partners rely on internally.',
        'Quantify trust as an operational KPI that predicts throughput and margin.',
      ],
      () => [
        'Sybil-resistant identity ensures only authorized partners sign critical steps.',
        'Immutable audit trails attach to ERP, MES, and QMS records without data duplication.',
        'Cost-per-trust analytics show savings from resolving disputes before they hit the balance sheet.',
      ],
      (ctx) => [
        'Audit prep time collapses because evidence is generated continuously.',
        sentence(`Customers and regulators receive proactive proof, not reactive apologies for ${ctx.pain.toLowerCase()}.`),
        'Partner ecosystem grows because transparency is now a competitive advantage.',
      ],
      [
        'Instrument a pilot lane or product line with DeVOTE-backed attestations.',
        'Automate compliance packet generation for your highest-risk regulation.',
        'Roll out trust dashboards to suppliers, carriers, and customer-facing teams.',
        'Use cost-per-trust metrics to re-invest savings into partner enablement.',
      ],
    ),
  },
  {
    id: 'market-research',
    label: 'Market Research & Stakeholder Polling',
    aliases: ['Market Research', 'Stakeholder Polling'],
    defaultGoal: 'produce defensible insights stakeholders act on immediately',
    proofPoints: ['zkProofs', 'sybilIdentity', 'costPerTrust'],
    questions: [
      q(
        'Which audience do you most need to convince with verifiable research?',
        [
          'Executive leadership making investment decisions',
          'Regulators assessing public sentiment or risk',
          'Customers evaluating product-market fit',
          'Employees weighing organizational changes',
          'Investors or donors validating impact',
          'Community stakeholders influenced by policy decisions',
        ],
      ),
      q(
        'What integrity risk undermines confidence in your findings?',
        [
          'Potential duplicate or inauthentic respondents skewing samples',
          'Lack of traceable consent for using collected data',
          'Slow field-to-insight cycle that makes data stale',
          'Inability to prove methodology to skeptical stakeholders',
          'Disparate regional regulations complicating compliance',
          'Manual reconciliation of qualitative and quantitative inputs',
        ],
      ),
      q(
        'How are stakeholders currently briefed on research and polling outcomes?',
        [
          'Slide decks summarizing topline metrics',
          'Static PDFs with sampling details in appendices',
          'Live readouts with limited time for validation questions',
          'Dashboards that lack authentication for underlying data',
          'Email digests linking to shared folders',
          'Ad-hoc conversations without supporting documentation',
        ],
      ),
      q(
        'What signal would prove your insights are trustworthy enough to trigger action?',
        [
          'Proof that each respondent was eligible and unique',
          'Chain-of-custody for how data was transformed into insights',
          'Side-by-side confidence intervals backed by cryptographic attestations',
          'Live dashboards that let stakeholders drill down into verified segments',
          'Audit trail showing policy or product decisions tied to research findings',
          'Automated alerts if sampling integrity drops below threshold',
        ],
      ),
      q(
        'Once proof is automated, where will you redeploy the saved capacity?',
        [
          'Launch more frequent pulse surveys without adding headcount',
          'Expand respondent incentives to reach underrepresented voices',
          'Invest in advanced analytics and scenario modelling',
          'Co-create programs with stakeholders using real-time feedback',
          'Open up insights portals to partners and regulators',
          'Build longitudinal studies that compound strategic value',
        ],
      ),
    ],
    narrative: makeNarrative(
      'Investor Memo',
      'Opportunity Seized',
      (ctx) =>
        sentence(
          `${ctx.industry} teams need stakeholders to act fast on trustworthy data. DeVOTE hardens research integrity so insights convert to decisions without protest.`,
        ),
      (ctx) => [
        'Bind sampling, consent, and analysis workflows to verifiable identity and proof.',
        withPain('Eliminate {PAIN} by turning every respondent touchpoint into a signed, auditable event.', ctx),
        'Deliver living insight dashboards that embed the proof alongside narratives.',
        'Quantify action velocity: how quickly insights trigger policy, product, or funding moves.',
      ],
      () => [
        'ZK-verified tallies validate samples instantly while keeping responses private.',
        'Sybil-resistant identity prevents inauthentic participation across digital channels.',
        'Cost-per-trust analytics show how proof-driven insights reduce churn, protest, or delays.',
      ],
      (ctx) => [
        'Stakeholders cut decision cycles because evidence travels with the insight.',
        sentence(`Research teams reclaim time from validation firefights and reinvest in strategic experiments despite ${ctx.pain.toLowerCase()}.`),
        'Trust metrics become board-level KPIs that justify continued investment in insight operations.',
      ],
      [
        'Instrument a flagship study or poll with DeVOTE proof from sampling to executive readout.',
        'Expose proof-backed dashboards to the stakeholder group with the highest skepticism.',
        'Automate action-tracking when insights trigger product, policy, or funding moves.',
        'Standardize the proof model across all research programs to scale momentum.',
      ],
    ),
  },
];

export const findIndustryProfile = (label: string): IndustryProfile | null => {
  const normalised = label.trim().toLowerCase();
  if (!normalised) {
    return null;
  }

  const matches = (value: string): boolean => value.trim().toLowerCase() === normalised;
  const fuzzyMatches = (value: string): boolean => {
    const candidate = value.trim().toLowerCase();
    return candidate.includes(normalised) || normalised.includes(candidate);
  };

  for (const profile of INDUSTRY_PROFILES) {
    if (matches(profile.label)) {
      return profile;
    }
    if (profile.aliases.some(matches)) {
      return profile;
    }
  }

  for (const profile of INDUSTRY_PROFILES) {
    if (fuzzyMatches(profile.label)) {
      return profile;
    }
    if (profile.aliases.some(fuzzyMatches)) {
      return profile;
    }
  }

  return null;
};

export const pickProofPoints = (
  profile: IndustryProfile,
  pain: string,
): ProofPointId[] => {
  const painLower = pain.toLowerCase();
  const priority: ProofPointId[] = [...profile.proofPoints];

  if (painLower.includes('risk') || painLower.includes('compliance') || painLower.includes('audit')) {
    return mergeProofs(['immutableAuditTrail', 'zkProofs'], priority);
  }
  if (painLower.includes('speed') || painLower.includes('latency') || painLower.includes('delay')) {
    return mergeProofs(['zkProofs', 'costPerTrust'], priority);
  }
  if (painLower.includes('trust') || painLower.includes('stakeholder') || painLower.includes('transparency')) {
    return mergeProofs(['immutableAuditTrail', 'sybilIdentity'], priority);
  }
  if (painLower.includes('fraud') || painLower.includes('identity')) {
    return mergeProofs(['sybilIdentity', 'zkProofs'], priority);
  }
  return Array.from(new Set(priority));
};

const mergeProofs = (preferred: ProofPointId[], defaults: ProofPointId[]): ProofPointId[] => {
  const merged: ProofPointId[] = [];
  for (const id of preferred) {
    if (!merged.includes(id)) {
      merged.push(id);
    }
  }
  for (const id of defaults) {
    if (!merged.includes(id)) {
      merged.push(id);
    }
  }
  return merged;
};

export const buildIndustryQuestions = (
  profile: IndustryProfile,
  ctx: TemplateContext,
): IndustryQuestion[] => profile.questions.map((factory) => factory(ctx));
