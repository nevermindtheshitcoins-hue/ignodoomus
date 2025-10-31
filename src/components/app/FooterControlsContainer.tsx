import React from 'react';

import { FooterControls } from './FooterControls';

/**
 * FooterControlsContainer
 * Architectural pass-through container for FooterControls.
 * FooterControls itself consumes context and handles guarded interactions.
 */
export const FooterControlsContainer: React.FC = () => {
  // Note: FooterControls component already handles context wiring
  // This container exists for consistency with architectural pattern
  return <FooterControls />;
};

FooterControlsContainer.displayName = 'FooterControlsContainer';
