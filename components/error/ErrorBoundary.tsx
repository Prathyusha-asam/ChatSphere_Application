"use client";
import React from "react";
//region Types
/**
 * ErrorBoundary state
 */
type State = {
  hasError: boolean;
};
//endregion Types
//region ErrorBoundary Component
/**
 * ErrorBoundary
 *
 * Catches unhandled runtime errors in the React component tree
 * and displays a fallback UI instead of crashing the app.
 *
 * - Uses React error boundary lifecycle methods
 * - Logs errors for debugging
 * - Allows user to retry by refreshing the page
 *
 * @extends React.Component
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  //region State
  /**
   * Tracks whether an error has occurred
   */
  state: State = { hasError: false };
  //endregion State
  //region Error Lifecycle
  /**
   * Updates state when an error is thrown
   */
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  /**
    * Logs error details for debugging
    *
    * @param error - Caught runtime error
    */
  componentDidCatch(error: Error) {
    console.error("Unhandled UI Error:", error);
  }
  //endregion Error Lifecycle
  //region Render
  /**
   * Renders fallback UI on error or children otherwise
   */
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm text-gray-500 mt-1">
            Please refresh or try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-black text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
  //endregion Render
}
//endregion ErrorBoundary Component
