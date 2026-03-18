import React, { Component, ErrorInfo, ReactNode } from "react";
import MemphisCard from "./MemphisCard";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(this.state.error?.message || "{}");
        if (parsedError.error) {
          errorMessage = `Firestore Error: ${parsedError.error} (Operation: ${parsedError.operationType})`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-lavender">
          <MemphisCard color="coral" className="max-w-md text-center">
            <h2 className="text-3xl font-black uppercase mb-4">Oops!</h2>
            <p className="font-bold mb-6">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-lemon border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Reload App
            </button>
          </MemphisCard>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
