import React from 'react';

import { useAssessmentHeader } from './AppContext';
import { HeaderProgress } from './HeaderProgress';

/**
 * HeaderProgressContainer
 * Wires the HeaderProgress component to the useAssessmentFlow hook.
 * Provides real-time updates as the user progresses through the assessment.
 */
export const HeaderProgressContainer: React.FC = () => {
  const header = useAssessmentHeader();

  const sessionCode = React.useMemo(
    () => header.map((bulb) => (bulb.digit !== null ? bulb.digit : '0')).join(''),
    [header],
  );

  return <HeaderProgress bulbs={header} sessionCode={sessionCode} />;
};

HeaderProgressContainer.displayName = 'HeaderProgressContainer';
