import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * Catches component tree errors and displays a fallback UI.
 * Maintains retro-industrial aesthetic while conveying error state.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" role="alert">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p>The assessment encountered an unexpected error. Please refresh the page to start over.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
                <summary>Error details (dev only)</summary>
                <pre style={{ marginTop: '8px', overflow: 'auto' }}>{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="error-boundary-reset-button"
              aria-label="Refresh page to reset"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.displayName = 'ErrorBoundary';

// Placeholder styles for error boundary
const styles = `
  .error-boundary-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: radial-gradient(circle at top, #1b1b1b 0%, #050505 70%);
    padding: 32px;
    box-sizing: border-box;
  }

  .error-boundary-content {
    background: #1a1a1a;
    border: 2px solid #ff4444;
    border-radius: 4px;
    padding: 32px;
    max-width: 600px;
    text-align: center;
    color: #ccc;
    font-family: 'Courier New', monospace;
  }

  .error-boundary-content h1 {
    color: #ff8800;
    font-size: 24px;
    margin: 0 0 16px 0;
    text-shadow: 0 0 8px rgba(255, 136, 0, 0.4);
  }

  .error-boundary-content p {
    font-size: 14px;
    line-height: 1.6;
    margin: 0 0 24px 0;
  }

  .error-boundary-reset-button {
    background: #ff8800;
    color: #000;
    border: 2px solid #ff8800;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .error-boundary-reset-button:hover {
    background: #ffaa22;
    border-color: #ffaa22;
    box-shadow: 0 0 12px rgba(255, 136, 0, 0.6);
  }

  .error-boundary-reset-button:active {
    transform: scale(0.98);
  }
`;

if (typeof document !== 'undefined') {
  const styleId = 'error-boundary-baseline-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}
