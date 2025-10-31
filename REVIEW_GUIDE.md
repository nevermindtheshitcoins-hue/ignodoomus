# DeVOTE Scenario Builder - Review Guide

## Repository Purpose

This repository implements a **DeVOTE Scenario Builder** - an interactive assessment tool for organizational decision-making. The application guides users through a structured flow of questions to generate AI-powered insights and narratives about business scenarios.

The core value proposition is transforming complex organizational assessments into an engaging, console-like experience that feels like operating a retro-industrial machine.

## Key Files to Review

### Architecture & Design
- **`src/components/app/StateMachine.ts`** - XState machine defining the entire assessment flow logic
- **`src/components/logic/useAssessmentFlow.ts`** - Main business logic hook integrating state management with React
- **`src/components/logic/selectors.ts`** - Pure functions transforming state into UI view models
- **`src/components/app/AppShell.tsx`** - Main component layout with four sacred zones (header/screen/keypad/footer)

### Data & Configuration
- **`src/components/flow/preliminary-questions.yaml`** - Static question data structure
- **`src/components/domain/types.ts`** - Core TypeScript interfaces and types
- **`package.json`** & **`tsconfig.json`** - Build and type configuration

### UI Implementation
- **`src/components/styles/global.css`** - Global styling and zone layouts
- **`src/components/styles/zones/`** - Zone-specific CSS (headerZone.css, screenZone.css, etc.)
- **`src/components/assets/imgsGood/uiComponents/`** - PNG assets for retro-industrial skin

### Documentation
- **`docs/PROJECT_STATUS.md`** - Current implementation status and roadmap
- **`docs/specs/ui-skin-implementation.plan.md`** - Detailed UI implementation specifications

## Missing Pieces (Focus Areas for Feedback)

### 1. Build System (Stage 2)
- No actual build output (TypeScript configured with `noEmit: true`)
- Missing bundler configuration (Webpack/Vite/Rollup)
- No production build scripts
- No deployment configuration

### 2. AI Integration (Stage 4)
- Currently using mock data for AI questions and narratives
- Missing real API endpoints for:
  - `generateAIQuestions()` function
  - `generateNarrative()` function
- No error handling for API failures
- No loading states for AI requests (beyond basic implementation)

### 3. Testing Infrastructure
- No unit tests for components or logic
- No integration tests for the assessment flow
- No E2E tests for user journeys

### 4. Runtime Setup
- No main entry point (index.html, main.tsx, etc.)
- No React rendering setup
- Missing environment configuration

## Review Focus Areas

### ✅ Architecture & Design
- State machine design and event handling
- Separation of concerns (logic/selectors/views)
- Type safety and domain modeling
- Component composition and reusability

### ✅ UI/UX Design
- Retro-industrial aesthetic implementation
- Accessibility considerations
- Responsive design patterns
- User flow and interaction design

### ⚠️ Implementation Gaps
- Build/deployment pipeline
- AI service integration points
- Testing strategy
- Production readiness

## Current Stage Context

This repository is in **Stage 1: UI Skin Implementation**. The core architecture is solid and ready for review. Feedback should prioritize architectural decisions and design patterns over missing infrastructure, as build systems and AI integration are planned for later stages.

The foundation is designed to support easy integration of real AI services and production builds without major refactoring.
