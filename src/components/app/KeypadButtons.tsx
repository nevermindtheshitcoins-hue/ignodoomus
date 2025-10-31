import React, { useState } from 'react';
import '../styles/zones/keypadZone.css';
import type { KeypadViewModel } from '../logic/selectors';
import type { AssessmentFlowActions } from '../logic/useAssessmentFlow';
import type { OptionId } from './StateMachine';

export interface KeypadButtonsProps {
  view: KeypadViewModel;
  actions: AssessmentFlowActions;
  reportText?: string | null;
}

/**
 * KeypadButtons Component
 * Renders the 7-button keypad for option selection.
 * Buttons 1-6 show dynamic labels; Button 7 = Other.
 * Handles XState event dispatching and validation.
 */
export const KeypadButtons: React.FC<KeypadButtonsProps> = React.memo(({ view, actions, reportText }) => {
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const handleButtonClick = (digit: number) => {
    if (view.type === 'report') {
      // Report phase button mapping: alternating CTA and Copy actions
      // 1/3/5/7 = CTA link, 2/4/6 = Copy to clipboard
      const isCopyButton = digit === 2 || digit === 4 || digit === 6;
      const isCtaButton = digit === 1 || digit === 3 || digit === 5 || digit === 7;

      if (isCtaButton) {
        // Open CTA link in new tab for external discovery call booking
        window.open('https://calendly.com/devote-discovery', '_blank');
        return;
      }

      if (isCopyButton) {
        // Copy report text to clipboard with user feedback
        const textToCopy = (reportText ?? '').trim();
        if (!textToCopy) {
          return;
        }
        navigator.clipboard.writeText(textToCopy).then(() => {
          setCopiedFeedback(true);
          setTimeout(() => setCopiedFeedback(false), 2000);
        });
        return;
      }
    }

    if (view.type === 'question') {
      // Dispatch XState event for option selection
      actions.selectOption(digit as OptionId);
    }
  };

  return (
    <div className="keypad-zone" role="region" aria-label="Keypad buttons">
      <div className="keypad-buttons">
        {view.buttons.map((button) => (
          <button
            key={button.digit}
            className={`keypad-button ${button.selected ? 'selected' : ''} ${button.disabled ? 'disabled' : ''}`}
            onClick={() => handleButtonClick(button.digit)}
            disabled={button.disabled}
            aria-label={`Button ${button.digit}: ${button.label}`}
            aria-pressed={button.selected}
          >
            <span className="button-digit">{button.digit}</span>
            <span className="button-label">{button.label}</span>
          </button>
        ))}
      </div>
      {copiedFeedback && (
        <div className="copied-feedback" role="status" aria-live="polite">
          Copied!
        </div>
      )}
    </div>
  );
});

KeypadButtons.displayName = 'KeypadButtons';

// Placeholder styles for Phase 2 baseline visuals
// Full retro-industrial polish tracked in Phase 4
// styles moved to external CSS (keypadZone.css)
