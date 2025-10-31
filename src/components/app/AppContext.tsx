import React, { createContext, useContext, useMemo } from 'react';

import {
  useAssessmentFlow,
  AssessmentFlowView,
  AssessmentFlowOptions,
} from '../logic/useAssessmentFlow';

interface AssessmentFlowProviderProps {
  children: React.ReactNode;
  options?: AssessmentFlowOptions;
}

const AssessmentFlowContext = createContext<AssessmentFlowView | null>(null);

export const AssessmentFlowProvider: React.FC<AssessmentFlowProviderProps> = ({
  children,
  options,
}) => {
  const flow = useAssessmentFlow(options);
  const value = useMemo(() => flow, [flow]);

  return <AssessmentFlowContext.Provider value={value}>{children}</AssessmentFlowContext.Provider>;
};

AssessmentFlowProvider.displayName = 'AssessmentFlowProvider';

export const useAssessmentFlowContext = (): AssessmentFlowView => {
  const context = useContext(AssessmentFlowContext);
  if (!context) {
    throw new Error('useAssessmentFlowContext must be used within an AssessmentFlowProvider');
  }
  return context;
};

export const useAssessmentActions = () => useAssessmentFlowContext().actions;
export const useAssessmentHeader = () => useAssessmentFlowContext().header;
export const useAssessmentScreen = () => useAssessmentFlowContext().screen;
export const useAssessmentKeypad = () => useAssessmentFlowContext().keypad;
export const useAssessmentFooter = () => useAssessmentFlowContext().footer;
