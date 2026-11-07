import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 border border-surface-border rounded-sm flex items-center justify-center bg-card">
              <span className="text-2xl text-amber font-mono">!</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground font-body mb-6 leading-relaxed">
              An unexpected error occurred. This has been noted. 
              Please try reloading the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs text-drift-red bg-card border border-surface-border p-4 rounded-sm mb-6 overflow-auto max-h-40 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              className="bg-amber text-background font-body text-sm font-medium px-6 py-2.5 rounded-sm hover:brightness-110 transition-all"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
