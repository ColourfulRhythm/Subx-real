import React from 'react';
import { motion } from 'framer-motion';

// =====================================================
// ERROR BOUNDARY COMPONENT - COMPREHENSIVE ERROR HANDLING
// =====================================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
      maxRetries: 3
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service if available
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      // Log to Firebase if available
      const { db } = await import('../firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      
      await addDoc(collection(db, 'error_logs'), {
        error_message: error.message,
        error_stack: error.stack,
        error_info: errorInfo,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.warn('Failed to log error to service:', logError);
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
    
    // Clear localStorage and reload
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { retryCount, maxRetries } = this.state;
      const canRetry = retryCount < maxRetries;

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🚨 Something Went Wrong
              </h1>

              {/* Error Details */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="text-xs text-gray-500 dark:text-gray-400">
                    <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                      Technical Details
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Retry Information */}
              {canRetry && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Retry {retryCount + 1} of {maxRetries}:</strong> You can try again or reset the application.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {canRetry ? (
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    🔄 Try Again
                  </button>
                ) : (
                  <button
                    onClick={this.handleReset}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    🚀 Reset Application
                  </button>
                )}
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  🏠 Go Home
                </button>
              </div>

              {/* Support Information */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If this problem persists, please contact support with the error details above.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Error ID: {this.state.error?.name || 'unknown'}-{Date.now()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =====================================================
// ERROR FALLBACK COMPONENT
// =====================================================

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚨 Component Error
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error?.message || 'An unexpected error occurred in this component.'}
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={resetErrorBoundary}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🔄 Try Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// =====================================================
// LOADING COMPONENT WITH ERROR HANDLING
// =====================================================

export const LoadingWithError = ({ loading, error, onRetry, children }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Try Again
        </button>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
