//region Auth Error Message Helper
/**
 * getAuthErrorMessage
 *
 * Normalizes Firebase authentication errors into
 * clean, user-friendly messages for UI display.
 *
 * @param error - Unknown error object thrown by Firebase/Auth logic
 * @returns string - Human-readable error message
 */
export function getAuthErrorMessage(error: unknown): string {
  // Handle non-Error cases safely
  if (!(error instanceof Error)) {
    return "Unexpected error occurred. Please try again.";
  }
  // Extract Firebase error code and message
  const errorCode = (error as any).code || "";
  const message = error.message.toLowerCase();
  // Email validation errors
  if (errorCode.includes("invalid-email") || message.includes("invalid-email"))
    return "Invalid email.";
  // Password errors
  if (errorCode.includes("wrong-password") || message.includes("wrong-password"))
    return "Invalid password.";
  // User not found
  if (errorCode.includes("user-not-found") || message.includes("user-not-found"))
    return "Invalid email.";
  // Network-related issues
  if (errorCode.includes("network-request-failed") || message.includes("network"))
    return "Network issue. Check your connection.";
  // Rate limiting
  if (errorCode.includes("too-many-requests") || message.includes("too-many-requests"))
    return "Too many attempts. Please try again later.";
  // Permission or service issues
  if (message.includes("permission") || message.includes("insufficient"))
    return "Service temporarily unavailable. Please try again later.";
  // Fallback error message
  return "Invalid email or password.";
}
//endregion Auth Error Message Helper