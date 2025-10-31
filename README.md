# DeVOTE Scenario Builder

A retro-industrial UI for conducting organizational assessments through an interactive flow of preliminary questions, AI-generated follow-ups, and narrative reports.

## Project Overview

This application implements a state-driven assessment flow using XState for state management and React for the UI. The interface features a console-like design with four distinct zones: header (progress bulbs), screen (question display), keypad (option selection), and footer (navigation controls).

The assessment process consists of:
1. **Preliminary Questions** (QP1-QP3): Static questions loaded from YAML
2. **AI-Generated Questions** (Qai1-Qai5): Dynamically generated based on initial responses
3. **Narrative Report**: AI-assembled summary of findings

## Setup

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation
```bash
npm install
```

### Development
```bash
# Type checking
npm run validate

# Build (type checking only, noEmit)
npm run build

# Strict type checking
npm run check
```

## Configuration Files

### package.json
```json
{
  "name": "dpss-validation",
  "version": "1.0.0",
  "description": "Validation setup for DPSS import path fix",
  "scripts": {
    "validate": "tsc --noEmit",
    "build": "tsc --noEmit",
    "check": "tsc --noEmit --strict"
  },
  "devDependencies": {
    "@types/node": "^24.8.1",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "xstate": "^5.23.0"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "archive"]
}
```

## Core Architecture

### State Management
The application uses XState for complex state transitions. The state machine handles:
- Question progression
- Input validation
- AI request states
- Error handling

Key file: `src/components/app/StateMachine.ts`

### Assessment Flow Hook
The main business logic is encapsulated in a custom React hook that:
- Interprets the XState machine
- Provides view models for each UI zone
- Handles user actions and AI requests
- Manages loading states

Key file: `src/components/logic/useAssessmentFlow.ts`

### Component Structure
```
src/components/
├── app/           # Main application components
├── domain/        # Types, constants, guards
├── flow/          # Question data (YAML)
├── logic/         # Business logic hooks and selectors
├── styles/        # CSS styling
└── assets/        # Images and UI skins
```

## Current Status

This project is in **Stage 1: UI Skin Implementation**. The core architecture is complete, but the build system and AI integration are pending implementation.

See `docs/PROJECT_STATUS.md` for detailed progress information.
