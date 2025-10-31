import React, { useEffect, useMemo, useState } from 'react';
import '../styles/zones/screenZone.css';

import type { AssessmentFlowActions } from '../logic/useAssessmentFlow';
import type { ScreenViewModel } from '../logic/selectors';
import { useAssessmentFlowContext } from './AppContext';

const EXTENDED_WAIT_THRESHOLD_MS = 10_000;

interface ScreenQuestionProps {
  screen: ScreenViewModel;
  actions: AssessmentFlowActions;
}

export const ScreenQuestionView: React.FC<ScreenQuestionProps> = React.memo(({ screen, actions }) => {
  const [showExtendedWait, setShowExtendedWait] = useState(false);

  useEffect(() => {
    if (screen.type === 'loading' && !screen.error) {
      setShowExtendedWait(false);
      let timer: number | undefined;
      if (typeof window !== 'undefined') {
        timer = window.setTimeout(() => {
          setShowExtendedWait(true);
        }, EXTENDED_WAIT_THRESHOLD_MS);
      }

      return () => {
        if (typeof window !== 'undefined' && typeof timer === 'number') {
          window.clearTimeout(timer);
        }
      };
    }

    setShowExtendedWait(false);
    return undefined;
  }, [screen]);

  // Screen is non-interactive - no event listeners per commandment
  // Other input state is managed through keypad/footer controls only

  // Memoized option items to prevent re-rendering on every state change
  // Only recalculates when screen type or options change
  const optionItems = useMemo(() => {
    if (screen.type !== 'question') {
      return [];
    }

    // Determine if this is a preliminary question (Qp1-Qp3) or AI question (Qai1-Qai5)
    const isPreliminaryStep = screen.step.startsWith('Qp');
    // Preliminary questions have 7 options, AI questions have 6 + "Other"
    const labels: string[] = isPreliminaryStep
      ? screen.options
      : [...screen.options, 'Other (please specify)'];

    // Map labels to JSX elements with proper accessibility attributes
    return labels.slice(0, 7).map((label, index) => {
      const digit = index + 1;
      const text = label?.trim() ?? '';
      return (
        <li key={`${screen.step}-option-${digit}`} className="screen-option">
          <span className="screen-option-digit" aria-hidden="true">
            {digit}
          </span>
          <span className="screen-option-label">{text || 'Option unavailable'}</span>
        </li>
      );
    });
  }, [screen]);

  const renderQuestion = () => {
    if (screen.type !== 'question') return null;
    return (
      <div className="screen-question" role="group" aria-labelledby="screen-question-title">
        <h2 id="screen-question-title" className="screen-heading">
          {screen.prompt}
        </h2>
        <p className="screen-instructions">Press keypad buttons 1-7 to make a selection. Button 7 opens Other input.</p>
        <ol className="screen-options" aria-label="Response options">
          {optionItems}
        </ol>
        {screen.other.visible && (
          <div className="screen-other" role="group" aria-labelledby="screen-other-label">
            <label id="screen-other-label" htmlFor="screen-other-input" className="screen-other-label">
              Other - please describe (5-50 characters)
            </label>
            <input
              id="screen-other-input"
              name="screen-other-input"
              type="text"
              autoComplete="off"
              inputMode="text"
              maxLength={50}
              className="screen-other-input"
              value={screen.other.draft}
              readOnly
              aria-describedby="screen-other-hint"
              aria-invalid={screen.other.draft.length > 0 && !screen.other.valid}
            />
            <div id="screen-other-hint" className="screen-other-hint">
              {screen.other.draft.length}/50 characters - {screen.other.valid ? 'Ready to confirm (press Enter)' : 'Needs 5-50 characters, no emoji/newlines'}
            </div>
          </div>
        )}
        {screen.error && (
          <div className="screen-error" role="alert">
            <p>{screen.error}</p>
            {renderErrorActions(screen.step, actions)}
          </div>
        )}
      </div>
    );
  };

  const renderLoading = () => {
    if (screen.type !== 'loading') return null;
    return (
      <div className="screen-loading" role="status" aria-live="polite">
        <p className="screen-loading-message">{screen.message}</p>
        {showExtendedWait && !screen.error && (
          <p className="screen-loading-wait">Still working - this can take a moment.</p>
        )}
        {screen.error && (
          <div className="screen-error" role="alert">
            <p>{screen.error}</p>
            {renderErrorActions(screen.step, actions)}
          </div>
        )}
      </div>
    );
  };

  const renderReport = () => {
    if (screen.type !== 'report') return null;
    return (
      <div className="screen-report" role="document" aria-live="polite">
        {screen.error && (
          <div className="screen-error" role="alert">
            <p>{screen.error}</p>
            {renderErrorActions('REPORT', actions)}
          </div>
        )}
        <div className="screen-report-content" tabIndex={0} aria-label="Generated report">
          {screen.narrative ? (
            <pre>{screen.narrative}</pre>
          ) : (
            <p className="screen-report-placeholder">Narrative will appear here once generated.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="screen-zone" aria-live="polite" aria-label="Scenario console display">
      <div className="screen-frame">
        {screen.type === 'question' && renderQuestion()}
        {screen.type === 'loading' && renderLoading()}
        {screen.type === 'report' && renderReport()}
      </div>
    </section>
  );
});

const handleRetry = (step: string | undefined, actions: AssessmentFlowActions) => {
  if (step === 'REPORT') {
    void actions.requestNarrative();
    return;
  }

  if (typeof step === 'string' && step.startsWith('Qai')) {
    void actions.requestAIQuestions();
    return;
  }
};

const renderErrorActions = (step: string | undefined, actions: AssessmentFlowActions) => {
  const canRetry = step === 'REPORT' || (typeof step === 'string' && step.startsWith('Qai'));

  return (
    <div className="screen-error-actions">
      {canRetry && (
        <button type="button" onClick={() => handleRetry(step, actions)}>
          Retry
        </button>
      )}
      <button type="button" onClick={actions.back}>
        Back
      </button>
      <button 
        type="button" 
        onClick={() => window.open('https://calendly.com/devote-discovery', '_blank')}
        className="screen-error-discovery"
      >
        Book a Discovery Call
      </button>
    </div>
  );
};

export const ScreenQuestionContainer: React.FC = React.memo(() => {
  const { screen, actions } = useAssessmentFlowContext();

  return <ScreenQuestionView screen={screen} actions={actions} />;
});

ScreenQuestionContainer.displayName = 'ScreenQuestionContainer';

// styles moved to external CSS (screenZone.css)
