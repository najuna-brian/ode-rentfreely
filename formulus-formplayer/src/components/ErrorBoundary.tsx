import React, { Component, ReactNode } from 'react';
import { tokens } from '../theme/tokens-adapter';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: tokens.spacing?.[5] ?? '20px',
            margin: tokens.spacing?.[5] ?? '20px',
            border: `${tokens.border?.width?.medium ?? '2px'} solid ${tokens.color.semantic.error[500]}`,
            borderRadius: tokens.border.radius.md,
            backgroundColor: tokens.color.semantic.error[50],
            color: tokens.color.semantic.error[600],
          }}>
          <h2>🚨 Something went wrong</h2>
          <details style={{ marginTop: tokens.spacing?.[3] ?? '12px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Error Details (click to expand)
            </summary>
            <pre
              style={{
                marginTop: tokens.spacing?.[3] ?? '12px',
                padding: tokens.spacing?.[3] ?? '12px',
                backgroundColor: tokens.color.neutral[50],
                border: `${tokens.border?.width?.thin ?? '1px'} solid ${tokens.color.neutral[300]}`,
                borderRadius: tokens.border.radius.md,
                fontSize: tokens.typography.fontSize.sm ?? '12px',
                overflow: 'auto',
              }}>
              {this.state.error?.toString()}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              marginTop: tokens.spacing?.[4] ?? '16px',
              padding: `${tokens.spacing?.[2] ?? '8px'} ${tokens.spacing?.[4] ?? '16px'}`,
              backgroundColor: tokens.color.semantic.error[500],
              color: tokens.color.neutral.white,
              border: 'none',
              borderRadius: tokens.border.radius.md,
              cursor: 'pointer',
            }}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
