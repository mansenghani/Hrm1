import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-6 bg-white dark:bg-[#0c1512] border border-red-200 dark:border-red-950/30 rounded-[24px] shadow-lg text-slate-800 dark:text-red-400">
          <h2 className="text-lg font-black tracking-tight mb-4 text-red-600 dark:text-red-400 uppercase">System Error Boundary Triggered</h2>
          <p className="text-xs font-bold text-slate-500 dark:text-[#829e92] mb-6">A component crash was intercepted. The console contains complete stack traces.</p>
          
          <pre className="p-4 bg-slate-50 dark:bg-[#111c18] border border-[#eceae3] dark:border-[#1a2d29] rounded-xl text-xs font-mono overflow-auto max-h-[300px] text-slate-700 dark:text-[#a3b3af] mb-6">
            {this.state.error && this.state.error.toString()}
            {"\n\nComponent Stack Trace:\n"}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
            className="px-5 py-2.5 bg-[#00a76b] hover:bg-[#00915c] text-white rounded-full font-bold text-xs transition-all cursor-pointer border-none shadow-sm"
          >
            Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
