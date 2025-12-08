import './index.css'; // MUST be the first import
import React, { ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-4 text-center">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md">
                <h1 className="text-2xl font-bold mb-2 text-red-400">System Error</h1>
                <p className="text-slate-400 mb-6">The application encountered an unexpected state. This has been logged.</p>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition-colors">
                  Reset System Data
                </button>
            </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);