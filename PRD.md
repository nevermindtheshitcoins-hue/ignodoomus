# DeVOTE Scenario Builder – Product Requirements Document

**Version:** 0.1 Draft  
**Last Updated:** 2025-10-19  
**Author:** Product Team (prepared by Codex)  
**Status:** In review

---

## 1. Product Overview
The DeVOTE Scenario Builder is an interactive assessment experience that converts stakeholder inputs into stakeholder-ready narratives demonstrating the value of DeVOTE's verifiable governance platform. The application guides a user through three preliminary questions, five AI-generated follow-ups, and delivers a 600–800 word narrative output (Investor Memo, Case Study, Internal Report, or Regulatory Submission). The interface embraces a retro-industrial console aesthetic with four zones—header, screen, keypad, footer—tailored for touch and desktop use. The product operates as a standalone web application with GPT-powered question generation and narrative assembly, showcasing DeVOTE's zero-knowledge proof, auditability, identity, and cost efficiencies.

## 2. Problem & Opportunity
- Decision makers evaluating DeVOTE struggle to translate cryptographic trust infrastructure into specific business impact.
- Sales and partnerships teams need a repeatable way to capture stakeholder context and respond with personalized materials.
- Existing decks are static and cannot surface the emotional drivers, compliance concerns, and operational constraints unique to each prospect.
- Opportunity: Provide an automated storytelling engine that produces investor-ready narratives, accelerating deal cycles and clarifying DeVOTE's differentiation.

## 3. Goals & Success Metrics
- Deliver a guided flow that feels cinematic and trustworthy while remaining fast and intuitive.
- Produce narratives that prospects can reuse immediately in presentations or funding discussions.
- Surface DeVOTE proof points that align with the user's industry, goal, and primary pain.

**Launch Success Metrics**
- Completion rate ≥ 70% for sessions reaching the narrative.
- AI narrative satisfaction score ≥ 4.0/5 (post-session survey).
- Narrative copy-to-clipboard rate ≥ 60% of completed sessions.
- Average question generation latency ≤ 10 seconds; narrative assembly ≤ 15 seconds.
- Error rate (API or state machine failures) < 5% of sessions.

## 4. Target Users & Personas
- **Strategic Decision Maker (“Visionary VP”)**: VP/Director exploring governance modernization; needs evidence of ROI and compliance readiness.
- **Innovation Consultant (“Trusted Advisor”)**: External consultant drafting roadmaps for institutional clients; needs customizable narratives quickly.
- **DeVOTE GTM Team (“Field Operator”)**: Internal sales or partnership lead using the tool live during discovery calls to co-create artifacts.
All personas value credibility, speed, and clarity. They expect serious tone, minimal jargon, and outputs they can forward without editing.

## 5. User Experience Overview
1. **Landing / Reset State**: Screen invites user to begin; footer buttons show Reset, Back (disabled), Confirm (disabled until selection).
2. **Preliminary Questions (Qp1–Qp3)**: YAML-driven questions about industry, goal, and pain. Keypad buttons 1–6 map to predefined options; button 7 opens inline text input (5–50 chars) rendered on the screen without breaking layout. Header bulbs light sequentially, displaying chosen option digit (7 for “Other”).
3. **AI Question Generation (Qai1–Qai5)**: After Qp3 confirmation, system shows “Generating questions…” animation, disables inputs, and triggers GPT call. Generated questions appear one at a time with six options each; “Other” still available via button 7 inline input.
4. **Narrative Assembly**: After Qai5 confirmation, UI shows “Assembling narrative…” loading state while GPT generates the 600–800 word document using the Narrative Matrix (Vessel + Dramatic Engine + Proof Points).
5. **Narrative Display**: Scrollable text area with formatted report; key CTA is “Copy to Clipboard” mapped to keypad button 1. Footer buttons allow Reset (clears session) and Back (review Qai5 answers if still in session).
6. **Session End**: Option to reset for new run. No account or persistence; refresh clears data.

## 6. Functional Requirements
**FR1. Content & Data Management**
- Store preliminary question metadata and proof point descriptions in external YAML/JSON for easy updates.
- Maintain session context in memory: answers, generated questions, selected narrative vessel/engine, final narrative.

**FR2. State Management**
- Use a single iterative AI question state with a counter (0–4) rather than discrete states to avoid state explosion.
- Guards ensure Confirm is enabled only after valid selection or Other text input within length constraints.
- Support Back navigation through all steps with guardrails against re-triggering AI unless inputs change.

**FR3. Header Zone**
- Render eight Nixie bulbs corresponding to Qp1–Qp3 and Qai1–Qai5.
- Each bulb displays the digit for the chosen option (1–6) or 7 for Other; never show free text.
- Completed bulbs remain lit; upcoming bulbs remain dim.

**FR4. Screen Zone**
- Display current question, option labels, inline Other input, loading animations, error messages, and the final narrative.
- Preserve CRT styling (scan lines, monospace typography) across states.
- Provide scrollable narrative with subtle scrollbar styling.

**FR5. Keypad Zone**
- Seven vertically stacked buttons labeled 1–7 with contextual labels shown on the screen.
- Button press triggers highlight animation and dispatches XState events.
- When narrative is displayed, only button 1 is active and labeled “Copy to Clipboard”; other buttons disabled and visibly inactive.

**FR6. Footer Zone**
- White Reset clears all state and returns to landing screen after confirmation modal.
- Red Back steps to previous state while preserving context.
- Green Confirm advances to next state; disabled until input validated.

**FR7. AI Integration**
- Question Generation: Use prompt template drawing on Qp1–Qp3 answers; parse GPT response into structured questions/options.
- Narrative Assembly: Supply eight user answers, vessel type, dramatic engine, and top three proof points; enforce 600–800 word constraint.
- Implement 3-attempt retry logic with exponential backoff (1s, 2s, 4s). After failure, show actionable error and offer retry.

**FR8. Error Handling**
- Display inline status messages for timeouts or API failures with options to retry or reset.
- Disable interactive controls during API calls to prevent duplicate submissions.
- Log session identifiers for support without storing PII.

**FR9. Copy & Sharing**
- “Copy to Clipboard” uses Web Clipboard API with success toast (“Copied!”) that auto-dismisses within 2 seconds.
- Provide guidance for manual copy if clipboard permission denied.

## 7. Non-Functional Requirements
**Performance**
- Initial load < 3 seconds on broadband.
- Maintain 60fps animations and <100ms UI response to button presses.
- Ensure bundle size is optimized for low-latency demos.

**Reliability**
- Handle GPT rate limiting gracefully with queueing or user messaging.
- Ensure state machine recovers cleanly after network interruption (retry prompts, maintain context).

**Security & Privacy**
- No persistent storage of user answers; session data resides only in memory.
- Sanitize all AI responses before rendering to prevent XSS.
- Secure API keys via server proxy or environment configuration; never expose in client bundle.

**Accessibility**
- Achieve WCAG 2.1 AA compliance: contrast ≥ 4.5:1, keyboard access for all controls, focus indicators, screen reader labels.
- Ensure buttons meet 44px touch target on mobile and respond to assistive input.

**Brand & Visual Fidelity**
- Retro-industrial aesthetic with CRT and Nixie elements must match design system.
- Consistent typography, color palette, and motion cues per design specs.

## 8. Scope & Assumptions
- In Scope: Single-session assessments, AI-driven question and narrative generation, copyable narrative output, retro console UI.
- Out of Scope: User authentication, data persistence, PDF export, localization, multi-user collaboration, analytics dashboard.
- Assume reliable access to GPT API with cost baseline $0.15 per full session.
- Assume staging and production environments mirror configuration for AI proxies and feature flags.

## 9. Dependencies
- OpenAI GPT (or equivalent LLM) for question and narrative generation.
- XState for deterministic flow control.
- YAML content files maintained by product marketing.
- Clipboard API availability; fallback messaging required for unsupported browsers.

## 10. Risks & Mitigations
- **LLM Output Quality**: Risk of generic or off-target narratives. Mitigate via rigorous prompt design, QA with 20+ real answer sets, and manual override workflow for critical demos.
- **Latency**: Slow API responses degrade experience. Mitigate with pre-loading animations, timeout messaging, and backend-side optimization.
- **Regulatory Claims**: Narrative may overpromise. Mitigate with proof point guardrails and legal review of prompt templates.
- **Accessibility Debt**: Visual-heavy design may impede compliance. Mitigate with early accessibility audits and keyboard-first testing.

## 11. Analytics & Monitoring
- Track session start/completion counts, drop-off per question, time per step, copy-to-clipboard usage, error occurrences, and retry counts.
- Capture qualitative feedback via optional post-session survey modal.
- Monitor AI cost per session and API error rates; alert if thresholds exceeded.
- Instrument console for structured logs (session ID, step, error code) without storing user text.

## 12. Release Plan & Milestones
- **Stage 1 – UI Skin Implementation (current)**: Complete four-zone layout, button interactions, base state machine (no AI). Exit criteria: interactive prototype with static content.
- **Stage 2 – State Machine & Content Integration**: Wire YAML questions, implement XState guards, support full eight-step flow. Exit criteria: deterministic navigation with placeholder AI outputs.
- **Stage 3 – AI Integration**: Connect GPT endpoints, implement retry/backoff, sanitize responses. Exit criteria: live end-to-end narrative generation within latency targets.
- **Stage 4 – Validation & Launch Prep**: Performance tuning, accessibility review, analytics instrumentation, go-to-market collateral. Exit criteria: checklist sign-off and launch approval.

## 13. Open Questions
- Final list of Narrative Vessels and Dramatic Engines—who owns curation and updates?
- Should session transcripts be exportable for internal follow-up, and how to handle privacy if so?
- What governance exists for updating proof point descriptions as DeVOTE capabilities evolve?
- Do we need multi-language support in MVP markets?
- Where should session IDs be surfaced to the user (header vs. footer) for support handoffs?

---

**Next Steps**
1. Review PRD with product, design, and engineering leads.
2. Align AI prompt owners and define quality review process.
3. Finalize analytics acceptance criteria prior to Stage 3 integration.

