"use client";

import { toast } from "@/components/UI/use-toast";

export interface ErrorDetails {
  message: string;
  context?: string;
  action?: string;
}

export class ErrorHandler {
  /**
   * Handle and display error as toast notification
   */
  static handle(error: unknown | string, context?: string): void {
    const errorMessage = this.getErrorMessage(error);

    toast({
      variant: "destructive",
      title: "Error",
      description: `${context ? `${context}: ` : ""}${errorMessage}`,
    });
  }

  /**
   * Handle success with toast notification
   */
  static success(message: string, description?: string): void {
    toast({
      variant: "default",
      title: "Success",
      description: description || message,
    });
  }

  /**
   * Extract meaningful error message from unknown error
   */
  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }

    return "An unexpected error occurred";
  }

  /**
   * Handle server action errors with specific formatting
   */
  static handleServerAction(
    result: { success: boolean; error?: string },
    context: string
  ): boolean {
    if (!result.success) {
      this.handle(result.error || "Operation failed", context);
      return false;
    }
    return true;
  }

  /**
   * Handle async operations with error catching
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handle(error, context);
      return null;
    }
  }
}

// Convenience exports
export const showError = ErrorHandler.handle;
export const showSuccess = ErrorHandler.success;
export const handleServerActionError = ErrorHandler.handleServerAction;
export const handleAsyncError = ErrorHandler.handleAsync;
