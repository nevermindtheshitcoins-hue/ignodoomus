import React, { useMemo } from 'react';
import '../styles/zones/headerZone.css';
import type { HeaderBulbModel } from '../logic/selectors';

export interface HeaderProgressProps {
  bulbs: HeaderBulbModel[];
  sessionCode?: string;
}

const NIXIE_STYLE_TAG_ID = 'header-progress-styles';

const resolveNixieSkinsEnabled = (): boolean => {
  const envValue =
    typeof process !== 'undefined' && typeof process.env !== 'undefined'
      ? process.env.ENABLE_NIXIE_SKINS
      : undefined;

  if (envValue !== undefined) {
    return envValue !== 'false';
  }

  if (typeof document !== 'undefined' && document.documentElement) {
    const htmlAttr = document.documentElement.getAttribute('data-enable-nixie-skins');
    if (htmlAttr !== null) {
      return htmlAttr !== 'false';
    }
  }

  return true;
};

const enableNixieSkins = resolveNixieSkinsEnabled();

/**
 * HeaderProgress Component
 * Renders the 8-bulb Nixie tube progress indicator for the assessment flow.
 * Displays selected option digits (1-7) for each step; 7 represents "Other".
 * Sacred zone: maintains immutable layout, shape, and proportion.
 * No persistence by design — resets on refresh.
 */
export const HeaderProgress: React.FC<HeaderProgressProps> = React.memo(({ bulbs, sessionCode }) => {
  // Compute 8-digit session code from bulbs for optional logging
  // Maps each bulb's digit to a string, using '0' for unlit bulbs
  const computedCode = useMemo(() => {
    return bulbs.map((bulb) => (bulb.digit !== null ? bulb.digit : '0')).join('');
  }, [bulbs]);

  // Log session code to console on final report (no storage)
  // This provides user support reference if they need help
  React.useEffect(() => {
    if (sessionCode || computedCode) {
      console.log(`[DeVOTE Session Code] ${sessionCode || computedCode}`);
    }
  }, [sessionCode, computedCode]);

  return (
    <header className="header-zone" role="region" aria-label="Progress indicator">
      <div className="nixie-tube-display" aria-live="polite" aria-atomic="true">
        {bulbs.map((bulb, index) => (
          <div
            key={`${bulb.step}-${index}`}
            className={[
              'nixie-bulb',
              enableNixieSkins ? 'nixie-bulb--skinned' : '',
              bulb.lit ? 'nixie-bulb--lit' : 'nixie-bulb--unlit',
            ]
              .filter(Boolean)
              .join(' ')}
            data-step={bulb.step}
            data-digit={bulb.digit ?? ''}
            aria-label={`Step ${bulb.step}: ${bulb.lit ? `digit ${bulb.digit}` : 'not answered'}`}
          >
            <span className="bulb-digit">{bulb.lit ? bulb.digit : ''}</span>
          </div>
        ))}
      </div>
    </header>
  );
});

HeaderProgress.displayName = 'HeaderProgress';

// HeaderProgress styles for Phase 3 Nixie bulb presentation
// styles moved to external CSS (headerZone.css)
