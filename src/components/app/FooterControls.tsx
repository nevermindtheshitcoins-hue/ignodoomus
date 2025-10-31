import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../styles/zones/footerZone.css';

import { useAssessmentFlowContext } from './AppContext';

const ENTER_KEY = 'Enter';
const BACK_KEYS = new Set(['Backspace', 'ArrowLeft']);
const ESC_KEY = 'Escape';

export const FooterControls: React.FC = React.memo(() => {
  const { footer, actions } = useAssessmentFlowContext();
  const [modalOpen, setModalOpen] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmResetRef = useRef<HTMLButtonElement | null>(null);
  const cancelResetRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const openModal = useCallback(() => {
    setModalOpen(true);
    if (typeof document !== 'undefined') {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    const target = lastFocusedRef.current ?? resetButtonRef.current;
    if (target) {
      target.focus();
    }
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      confirmResetRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [modalOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (modalOpen) {
        // Handle modal keyboard navigation
        if (event.key === ESC_KEY) {
          event.preventDefault();
          closeModal();
          return;
        }

        // Trap focus within modal using Tab key
        if (event.key === 'Tab') {
          const focusables = [confirmResetRef.current, cancelResetRef.current].filter(
            (node): node is HTMLElement => node !== null,
          );
          if (focusables.length === 0) {
            return;
          }

          event.preventDefault();
          const active = document.activeElement as HTMLElement | null;
          const index = focusables.findIndex((node) => node === active);
          const nextIndex = event.shiftKey
            ? (index <= 0 ? focusables.length - 1 : index - 1)
            : (index + 1) % focusables.length;
          focusables[nextIndex]?.focus();
        }
        return;
      }

      // Don't handle keyboard shortcuts during loading states
      if (footer.loading) {
        return;
      }

      // Global keyboard shortcuts for main flow
      if (event.key === ENTER_KEY && footer.confirmEnabled) {
        event.preventDefault();
        actions.confirm();
        return;
      }

      if (BACK_KEYS.has(event.key) && footer.backEnabled) {
        event.preventDefault();
        actions.back();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, footer.backEnabled, footer.confirmEnabled, footer.loading, modalOpen, closeModal]);

  const onResetClick = useCallback(() => {
    if (!footer.resetEnabled) {
      return;
    }
    openModal();
  }, [footer.resetEnabled, openModal]);

  const confirmReset = useCallback(() => {
    setModalOpen(false);
    actions.reset();
  }, [actions]);

  const footerState = useMemo(
    () => ({
      resetDisabled: !footer.resetEnabled,
      backDisabled: !footer.backEnabled,
      confirmDisabled: !footer.confirmEnabled,
      loading: footer.loading,
      error: footer.error,
    }),
    [footer],
  );

  return (
    <footer className="footer-zone" role="region" aria-label="Scenario controls">
      <div className="footer-shell">
        <button
          ref={resetButtonRef}
          type="button"
          className="footer-button footer-button--reset"
          onClick={onResetClick}
          disabled={footerState.resetDisabled}
          aria-disabled={footerState.resetDisabled}
        >
          Reset
        </button>
        <button
          type="button"
          className="footer-button footer-button--back"
          onClick={() => actions.back()}
          disabled={footerState.backDisabled}
          aria-disabled={footerState.backDisabled}
        >
          Back
        </button>
        <button
          type="button"
          className="footer-button footer-button--confirm"
          onClick={() => actions.confirm()}
          disabled={footerState.confirmDisabled}
          aria-disabled={footerState.confirmDisabled}
        >
          Confirm
        </button>
      </div>

      {modalOpen && (
        <div className="footer-modal-backdrop" role="presentation">
          <div
            className="footer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-modal-title"
          >
            <h3 id="footer-modal-title">Start over?</h3>
            <p>Progress will be lost if you reset now.</p>
            <div className="footer-modal-actions">
              <button
                ref={confirmResetRef}
                type="button"
                className="footer-modal-button footer-modal-button--confirm"
                onClick={confirmReset}
              >
                Confirm Reset
              </button>
              <button
                ref={cancelResetRef}
                type="button"
                className="footer-modal-button footer-modal-button--cancel"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {footerState.loading && (
        <div className="footer-loading" role="status" aria-live="polite">
          Processing...
        </div>
      )}

      {footerState.error && !modalOpen && (
        <div className="footer-error" role="alert">
          {footerState.error}
        </div>
      )}
    </footer>
  );
});

FooterControls.displayName = 'FooterControls';

// styles moved to external CSS (footerZone.css)
