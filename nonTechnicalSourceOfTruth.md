# DeVOTE Pilot Scenario Simulator
## System of Truth (SoT) — Human-Readable Guide

**Version:** 1.0 MVP  
**Last Updated:** October 19, 2025  
**Owner:** DeVOTE DAO LLC

---

## 1. Abstract / Elevator Pitch

The **DeVOTE Pilot Scenario Simulator** is a guided storytelling tool that transforms cryptographic trust infrastructure into business-ready strategic documents. Users answer 3 preliminary questions about their industry, goals, and pain points, then respond to 5 AI-generated follow-up questions. The system assembles a personalized narrative—formatted as an Investor Memo, Case Study, Internal Report, or Regulatory Submission—demonstrating how DeVOTE's verifiable governance platform solves their specific challenges.

**Core Innovation:** Modular Narrative Matrix combining Narrative Vessel (document format) + Dramatic Engine (emotional driver) + Proof Points (technical mechanisms) to create customized, stakeholder-ready outputs.

**Target Outcome:** Users receive a 600-800 word document they can present in board meetings or funding discussions.

**Technical Foundation:** DeVOTE provides end-to-end verifiable elections using zero-knowledge proofs, blockchain immutability, and multi-party computation. Key capabilities: ZK-verified tallies (<3 sec verification), immutable audit trails, sybil-resistant identity, and 92% cost reduction vs. legacy systems.

---

## 2. UI Mapping and Naming

### UI Component Zones (Four Sections)

#### **HEADER** — Nixie Tube Progress Indicator
- **What:** 8 illuminated bulbs showing journey progression
- **Function:** Each bulb lights sequentially as user completes steps (Qp1 → Qp2 → Qp3 → Qai1 → Qai2 → Qai3 → Qai4 → Qai5)
- **Display:** Shows the selected option digit inside each lit bulb. For Other, display digit "7" (never user text). Final state shows the 8-digit session-code illusion only.
- **Visual Style:** Nixie clock aesthetic—amber glow, glass tubes, retro-industrial

#### **SCREEN** — Central Display Area
- **What:** Primary content window where all text appears
- **Function:** Displays questions, narratives, loading states, and final report
- **Content Types:**
  - Preliminary questions with context
  - AI-generated questions (text only)
  - Loading animations ("Generating questions..." / "Assembling narrative...")
  - Final scrollable narrative text
- **Visual Style:** CRT monitor aesthetic—scan lines, monospace font, utilitarian

#### **KEYPAD** — 7-Button Side Panel
- **What:** Vertical array of option selection buttons
- **Function:** Dynamic labels change based on current state
- **Button Mapping:**
  - Buttons display digits 1–7; option labels render on SCREEN alongside the question
  - Preliminary Questions (Qp1–Qp3): 6 options on buttons 1–6; button 7 = Other (opens inline text input, 5–50 chars, single-line)
  - AI Questions (Qai1–Qai5): 6 options on buttons 1–6; button 7 = Other (opens inline text input, 5–50 chars, single-line)
  - Report Screen: Button 1 = "Copy to Clipboard", buttons 2–7 inactive
- **Visual Style:** Industrial push-buttons—rubber caps, metal bezels, backlit when active

#### **FOOTER** — 3 Operation Buttons
- **What:** Global control panel (white, red, green buttons)
- **Function:** Fixed actions throughout journey
- **Button Definitions:**
  - **White (Left):** RESET — Clear all data, return to start
  - **Red (Center):** CANCEL/BACK — Return to previous step
  - **Green (Right):** CONFIRM — Advance to next step (disabled until valid input)
- **Visual Style:** Large arcade-style buttons—white matte, red glossy emergency-stop, green illuminated

---

## 3. Overview of Technical Workings

### Architecture Pattern
**Hybrid XState + Data Graph:** State machine controls flow logic, question content lives in external data files. This prevents state explosion (35 potential branches don't create 35 states).

### Core Components
1. **State Machine (XState):** Manages user progression through 8 steps, enforces transition rules, triggers AI calls
2. **Context Store:** Holds user answers, generated questions, and final narrative in memory (no backend, no localStorage)
3. **AI Integration Layer:** Handles GPT API calls for question generation and narrative assembly with retry logic
4. **UI Renderer:** Updates Header/Screen/Keypad/Footer based on current state and context data

### Data Flow
```
User Input → XState Event → Guard Check → Context Update → UI Re-render
                                ↓
                         (If needed) AI API Call → Store Result → Continue
```

### Session Lifecycle
- **Start:** User lands on Qp1, all context empty
- **Progress:** Each answer stored in context, Nixie bulbs light sequentially
- **AI Trigger:** After Qp3, system calls GPT to generate 5 questions
- **Completion:** After Q5, system calls GPT to assemble narrative
- **End:** User views report, can copy text or reset
- **Exit:** Browser refresh = complete data loss (no persistence)

---

## 4. UX Functional Mapping

### User Journey (8 Steps)

**Step 1-3: Preliminary Questions (Qp1, Qp2, Qp3)**
- User sees question text on SCREEN with six option labels listed beneath
- User presses keypad button 1–6 to pick a listed option or button 7 to choose Other
- Selected button highlights and the matching Nixie bulb lights with that digit
- Green (Confirm) activates once a valid selection or Other text is present; user confirms to advance

**Other (Option 7) Behavior**
- When button 7 is pressed, the on-SCREEN answer key fades and a blinking-cursor text input appears beneath the question text
- Input is single-line, 5–50 characters; letters, numbers, and common punctuation allowed; no emoji/newlines
- Green (Confirm) activates only when the text meets the rules
- Confirm stores the Other response, lights the current bulb with digit "7", and advances to the next step

**Step 4: AI Question Generation (Transition)**
- Screen shows loading animation: "Crafting personalized questions..."
- System sends Qp1, Qp2, Qp3 answers to GPT
- Waits for response (max 10 seconds before showing extended wait message)
- On success: Stores 5 questions + options, advances to Qai1
- On failure: Retries 3 times, then shows error message with "Try again later" or "Book a call" CTA

**Step 5-9: AI Questions (Qai1–Qai5)**
- User sees question text on SCREEN
- Keypad shows 6 options on buttons 1–6; button 7 = Other (opens inline text input, 5–50 chars, single-line, no emoji/newlines)
- User selects an option or enters valid Other text; Green (Confirm) activates when rules are met
- Red button allows going back to the previous question
- After Qai5 confirmation, advances to narrative assembly

**Step 10: Narrative Assembly (Transition)**
- Screen shows loading animation: "Assembling your strategic narrative..."
- System sends all 8 answers + context to GPT
- Same retry logic as question generation
- On success: Displays final report
- On failure: Same error handling

**Step 11: Report Display (Final)**
- Screen shows scrollable narrative text
- Keypad button 1 = "Copy to Clipboard" (copies full text)
- White button = "Start Over" (resets everything)
- Red and Green buttons inactive
- Nixie display shows full 8-digit session code

### Button State Logic

**Green Button Activation Rules:**
- Preliminary Questions: Enabled when keypad selection made (1–6) or valid Other text (5–50 chars)
- Custom Text Input: Enabled when 5–50 characters entered
- AI Questions: Enabled when keypad selection made (1–6) or valid Other text (5–50 chars)
- Loading States: Disabled
- Report Screen: Disabled

**Red Button Behavior:**
- Always returns to previous step (except on loading screens and final report)
- Preserves prior answers when going back

**White Button Behavior:**
- Always available (except during loading)
- Shows confirmation if clicked mid-journey: "Start over? Progress will be lost."

---

## 5. Preliminary Questions & AI Requirements

### Preliminary Questions (Qp1, Qp2, Qp3)

**Purpose:** Establish user's context (industry, objective, pain point) to enable AI personalization.

**Qp1 — Industry Selection**
- 6 predefined options on buttons 1–6; button 7 = Other (custom text input, 5–50 chars, single-line)
- Source of truth lives in `src/components/flow/preliminary-questions.yaml`

**Qp2 — Primary Goal**
- 6 predefined options covering funding, compliance, trust, cost, transparency, fraud/abuse; button 7 = Other (same validation)
- Stored in the same consolidated YAML file

**Qp3 — Pain Point**
- 6 predefined options covering disputes, audits, proof gaps, skepticism, manual overhead, legacy systems; button 7 = Other (same validation)
- Stored in the same consolidated YAML file

**Constraint:** Questions must not change once finalized—UI depends on the stable 7-button structure (6 options + Other).

**Source Note:** Legacy industry data files in `src/components/flow/questionsPrelim/` are retained for archival reference only. The MVP flow reads exclusively from `src/components/flow/preliminary-questions.yaml`, and every question is single-select during Phase 1.

### AI-Generated Questions (Qai1–Qai5)

**Purpose:** Surface specific operational constraints, competitive pressures, and stakeholder dynamics that generic questions can't reveal.

**Requirements:**
- Exactly 5 questions per session
- Each question provides exactly 6 multiple-choice options (mapped to buttons 1–6); button 7 is always reserved for Other (custom text input)
- Questions must reference user's prior answers (industry, goal, pain point)
- Progressive depth: Qai1 = broad context, Qai5 = strategic implications
- No repeated phrasing from user's own words

**Quality Criteria:**
- Specificity: Does the question feel tailored to their situation?
- Relevance: Does it reveal information useful for narrative assembly?
- Clarity: Can user understand what's being asked without confusion?

**Failure Mode:** If AI cannot generate questions after 3 retries, show apologetic error and offer to book a discovery call instead.

---

## 6. AI Integration & Prompt Requirements

### API Configuration
- **Provider:** OpenAI GPT (current model TBD by implementation team)
- **Timeout:** 10 seconds per call before showing extended wait message
- **Retry Logic:** 3 attempts with exponential backoff (1s, 2s, 4s delays)
- **Cost Consideration:** Expect ~$0.15 per complete user session (question gen + narrative assembly)

### Question Generation Prompt Template

**Input Variables:**
- `{Qp1_INDUSTRY}` — User's selected or custom industry
- `{Qp2_GOAL}` — User's primary objective
- `{Qp3_PAIN}` — User's biggest vulnerability

**Prompt Structure:**
```
You are crafting personalized questions for a {Qp1_INDUSTRY} organization that wants to {Qp2_GOAL} and is concerned about {Qp3_PAIN}.

Generate exactly 5 multiple-choice questions (6 options each) that:
1. Reference their specific industry and stated goals
2. Reveal operational constraints, competitive pressures, and stakeholder dynamics
3. Progress from broad context (Qai1) to strategic implications (Qai5)
4. Avoid repeating the exact words they used in their answers

Output format:
Qai1: [Question text]
1) [Option]
2) [Option]
3) [Option]
4) [Option]
5) [Option]
6) [Option]

[Repeat for Qai2–Qai5]

Notes for model: Do not include an "Other" option. The UI supplies button 7 as Other with user-provided text.
```

**Output Parsing:** System must extract questions and 6 options into structured data; UI adds a separate Other input path.

### Narrative Assembly Prompt Template

**Input Variables:**
- All 8 user answers (Qp1, Qp2, Qp3, Qai1–Qai5)
- Suggested Narrative Vessel (Investor Memo, Case Study, Internal Report, Regulatory Submission)
- Suggested Dramatic Engine (Crisis Averted, Opportunity Seized, Legacy Transformed)
- Top 3 relevant Proof Points (ZK-Verified Tally, Immutable Audit Trail, Sybil-Resistant Identity, Cost-Per-Trust Metric)

**Prompt Structure:**
```
You are writing a {VESSEL_TYPE} for a {Qp1_INDUSTRY} organization.

Context from their answers:
- Primary Goal: {Qp2_GOAL}
- Key Vulnerability: {Qp3_PAIN}
- Additional Context: [Summarize Qai1–Qai5 answers]

Narrative Requirements:
- Format: {VESSEL_TYPE} (follow standard business document structure)
- Emotional Arc: {DRAMATIC_ENGINE}
- Must incorporate these DeVOTE capabilities: {PROOF_POINT_1}, {PROOF_POINT_2}, {PROOF_POINT_3}

Write a 600-800 word document that:
1. Opens with a compelling hook referencing their pain point
2. Explains how DeVOTE's verifiable governance solves their specific problem
3. Integrates proof points as concrete mechanisms, not buzzwords
4. Concludes with a clear outcome scenario
5. Uses professional tone appropriate for stakeholder presentation

Do not use generic corporate language. Make it feel personalized to their situation.
```

**Output:** Raw text narrative ready for display on Screen.

### Proof Points (Reference Data)

**Four Core Mechanisms:**
1. **ZK-Verified Tally** — Results confirmed in <3 seconds without revealing individual votes
2. **Immutable Audit Trail** — Permanent, tamper-evident records accepted by regulators
3. **Sybil-Resistant Identity** — Automated duplicate detection preserving anonymity
4. **Cost-Per-Trust Metric** — 92% reduction in dispute resolution costs

**Selection Logic:** System weights these based on user's goal and pain point (e.g., if goal = compliance, prioritize Immutable Audit Trail).

**Storage:** Detailed descriptions stored in `/content/proofPoints.yaml` for AI prompt injection.

---

## 7. Top Ten Implementation Tips

1. **Use a single iterative AI_QUESTION state with a counter (0-4) instead of creating five separate states.**
2. **Store all user answers in a simple context object—don't overcomplicate data structures.**
3. **Make Nixie bulbs update immediately on selection to give instant visual feedback.**
4. **Disable all buttons during AI API calls to prevent double-submissions and race conditions.**
5. **No persistence by design (per Commandments).** Accidental refresh resets session; provide clear Reset confirmation and progressive feedback to reduce accidental loss.
6. **Log session codes for user support—it's their only reference if they need help.**
7. **Test AI prompts with 20+ real answer combinations before launch to catch generic output.**
8. **Build the Reset confirmation modal early—users will accidentally click it.**
9. **Make the "Copy to Clipboard" action show a brief "Copied!" confirmation so users know it worked.**
10. **Plan for the 3-retry failure case from day one—don't treat it as an edge case.**

---

## 8. Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Oct 19, 2025 | Initial SoT — MVP scope definition | Product Owner |

---

**End of Document**

**This SoT defines what the simulator does, how users experience it, and what technical pieces need to exist. It does not prescribe implementation details—those are the development team's domain.**

---

_Verified on 2025-10-19 by Codex — consistent with all active project documentation._
