import React from 'react';
import '../styles/global.css';

import { AssessmentFlowProvider, useAssessmentFlowContext } from './AppContext';
import { ErrorBoundary } from './ErrorBoundary';
import { HeaderProgressContainer } from './HeaderProgressContainer';
import { ScreenQuestionContainer } from './ScreenQuestion';
import { KeypadButtons } from './KeypadButtons';
import { FooterControls } from './FooterControls';

const ConsoleLayout: React.FC = () => {
  const { keypad, actions, screen } = useAssessmentFlowContext();
  const reportText = screen.type === 'report' ? screen.narrative ?? '' : null;

  return (
    <div className="console">
      <div className="console__header">
        <HeaderProgressContainer />
      </div>
      <div className="console__body">
        <div className="console__screen">
          <ScreenQuestionContainer />
        </div>
        <aside className="console__keypad" aria-label="Option keypad zone">
          <KeypadButtons view={keypad} actions={actions} reportText={reportText} />
        </aside>
      </div>
      <div className="console__footer">
        <FooterControls />
      </div>
    </div>
  );
};

ConsoleLayout.displayName = 'ConsoleLayout';

export const AppShell: React.FC = () => (
  <ErrorBoundary>
    <AssessmentFlowProvider>
      <div className="app-shell">
        <ConsoleLayout />
      </div>
    </AssessmentFlowProvider>
  </ErrorBoundary>
);

AppShell.displayName = 'AppShell';

// styles moved to external CSS (global.css)
