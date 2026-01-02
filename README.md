# DeVOTE Scenario Builder

An interactive assessment experience that converts stakeholder inputs into stakeholder-ready narratives demonstrating the value of DeVOTE's verifiable governance platform.

![DeVOTE Scenario Builder](./public/assets/uiConsoleShell.png)

## Overview

The DeVOTE Scenario Builder is a retro-industrial console application that guides users through a personalized assessment flow to generate compelling governance narratives. The application features a unique four-zone interface (header with Nixie bulbs, screen, keypad, and footer controls) that provides an immersive, cinematic experience while remaining fast and intuitive.

### Key Features

- **Guided Assessment Flow**: 3 preliminary questions + 5 AI-generated follow-ups
- **AI-Powered Content**: Dynamic question generation and narrative assembly using OpenAI
- **Retro-Industrial UI**: Complete console aesthetic with Nixie bulbs, CRT styling, and tactile keypad
- **Multiple Output Formats**: Generates Investor Memos, Case Studies, Internal Reports, or Regulatory Submissions
- **Real-time Experience**: Typewriter effect for narratives, loading animations, and responsive feedback
- **Copy-to-Clipboard**: One-click narrative export for immediate use in presentations
- **Session-Based**: No data persistence, perfect for demos and prospect interactions

## How It Works

1. **Preliminary Questions** (Qp1-Qp3): Industry, goals, and vulnerability assessment
2. **AI Question Generation**: Personalized follow-up questions based on initial responses
3. **Narrative Assembly**: AI generates a 600-800 word professional narrative
4. **Export & Share**: Copy narrative to clipboard for immediate use

## Technology Stack

- **Framework**: Next.js 16+ with React 19
- **AI Integration**: OpenAI GPT-4o-mini for question generation, GPT-4.1-mini for narratives
- **Styling**: Custom CSS with retro-industrial console aesthetics
- **State Management**: React hooks with session-based state
- **API Architecture**: RESTful API routes with retry logic and error handling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devote-scenario-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp env.local.template .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Production Deployment

Build and start the production server:

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/devote/questions
Generates 5 personalized AI questions based on preliminary answers.

**Request Body:**
```json
{
  "prelimAnswers": [
    { "id": "Qp1", "label": "Executive leadership (CEO, COO, Board)" },
    { "id": "Qp2", "label": "Unlock new funding or investor confidence" },
    { "id": "Qp3", "label": "Election or voting disputes that won't die" }
  ]
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "Qai1",
      "question": "What is your current governance decision-making timeline?",
      "options": ["<1 month", "1-3 months", "3-6 months", "6-12 months", ">1 year", "Ad hoc"]
    }
    // ... 4 more questions
  ]
}
```

### POST /api/devote/narrative
Assembles a personalized governance narrative based on all user answers.

**Request Body:**
```json
{
  "answers": [
    { "id": "Qp1", "label": "Executive leadership (CEO, COO, Board)" },
    { "id": "Qp2", "label": "Unlock new funding or investor confidence" },
    { "id": "Qp3", "label": "Election or voting disputes that won't die" },
    { "id": "Qai1", "label": "1-3 months" },
    // ... additional AI question answers
  ]
}
```

**Response:**
```json
{
  "narrative": "Generated 600-800 word governance narrative..."
}
```

## User Experience Flow

The application follows a structured 11-step flow:

1. **PRELIM_1**: First preliminary question (role/industry)
2. **PRELIM_2**: Second preliminary question (primary objective)  
3. **PRELIM_3**: Third preliminary question (key vulnerability)
4. **LOADING_AI_QUESTIONS**: AI processing state for question generation
5. **AI_Q1-QAI5**: Five AI-generated personalized questions
6. **LOADING_NARRATIVE**: AI processing state for narrative assembly
7. **REPORT**: Final narrative display with copy functionality
8. **ERROR**: Error state with retry options

### Navigation Controls

- **Keypad (1-7)**: Select answer options, with button 1 serving as "Copy to Clipboard" in report view
- **Reset Button**: Clear session and return to start
- **Back Button**: Navigate to previous question (disabled in certain states)
- **Confirm Button**: Advance to next step (enabled only with valid selection)

## Architecture Highlights

### State Management
- Single iterative state machine for AI questions (0-4 counter approach)
- Session-based state with no persistence
- Robust error handling with retry logic and exponential backoff

### AI Integration
- **Question Generation**: Uses GPT-4o-mini with structured JSON prompts
- **Narrative Assembly**: Uses GPT-4.1-mini with custom templates for different narrative types
- **Smart Templates**: Automatically selects narrative vessel and dramatic engine based on user inputs

### UI/UX Features
- **Nixie Bulb Display**: 8 bulbs showing selected answers throughout the flow
- **Typewriter Effect**: Progressive narrative display for engaging user experience
- **Retro Styling**: Complete console aesthetic with CRT scan lines and industrial design
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT integration | Yes |

### Narrative Templates

The application uses intelligent template selection based on user responses:

**Narrative Vessels:**
- Regulatory Submission (for compliance-focused users)
- Investor Memo (for funding-focused users)  
- Internal Report (for operational users)
- Case Study (default)

**Dramatic Engines:**
- Crisis Averted (for users with fraud/dispute concerns)
- Opportunity Seized (for growth-focused users)
- Legacy Transformed (default)

## Development

### Project Structure

```
src/
├── app/
│   ├── api/devote/
│   │   ├── questions/route.ts    # AI question generation
│   │   └── narrative/route.ts    # AI narrative assembly
│   ├── layout.tsx                # Root layout with fonts
│   ├── page.tsx                  # Main application component
│   └── globals.css               # Global styles and console aesthetics
├── public/assets/                # Console UI assets (PNG files)
└── package.json                  # Dependencies and scripts
```

### Key Components

- **Main Application** (`src/app/page.tsx`): Complete state machine and UI logic
- **Question Generation** (`src/app/api/devote/questions/route.ts`): OpenAI integration for dynamic questions
- **Narrative Assembly** (`src/app/api/devote/narrative/route.ts`): OpenAI integration for narrative creation
- **Styling** (`src/app/globals.css`): Complete retro-industrial console aesthetic

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)
The easiest deployment option is Vercel, which provides seamless Next.js integration:

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Add `OPENAI_API_KEY` environment variable in Vercel dashboard
4. Deploy automatically

### Other Platforms
The application can be deployed to any platform supporting Node.js:

- Netlify
- Railway  
- Heroku
- AWS Amplify
- DigitalOcean App Platform

## Troubleshooting

### Common Issues

**"Missing OPENAI_API_KEY" Error**
- Ensure you've set the `OPENAI_API_KEY` environment variable
- Verify your OpenAI API key is valid and has sufficient credits

**Slow AI Generation**
- Check your OpenAI API rate limits
- Consider upgrading your OpenAI plan for higher throughput

**UI Not Loading Properly**
- Clear browser cache and reload
- Check browser console for CSS/styling errors
- Ensure all assets in `/public/assets/` are accessible

### Performance Optimization

- The application is optimized for <3s initial load times
- AI response times typically: 5-10s for questions, 10-15s for narratives
- Bundle size is optimized for low-latency demos

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Submit a pull request with detailed description

## License

[Add your license information here]

## Support

For technical support or questions about the DeVOTE platform:
- Review the [Product Requirements Document](./PRD.md)
- Check the troubleshooting section above
- Contact the DeVOTE development team

---

**Built with ❤️ for DeVOTE - Transforming Governance Through Verifiable Technology**