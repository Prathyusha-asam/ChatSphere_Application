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
  const errorCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
      ? (error as { code: string }).code
      : "";
 
  const message = error.message.toLowerCase();
 
  switch (true) {
    // ✅ EMAIL ALREADY EXISTS (ADDED — FIXES YOUR ISSUE)
    case errorCode.includes("email-already-in-use") ||
      message.includes("email-already-in-use"):
      return "Email already exists.";
 
    // Email validation errors
    case errorCode.includes("invalid-email") ||
      message.includes("invalid-email"):
      return "Invalid email.";
 
    // Password errors
    case errorCode.includes("wrong-password") ||
      message.includes("wrong-password"):
      return "Invalid password.";
 
    // User not found
    case errorCode.includes("user-not-found") ||
      message.includes("user-not-found"):
      return "Invalid email.";
 
    // Network-related issues
    case errorCode.includes("network-request-failed") ||
      message.includes("network"):
      return "Network issue. Check your connection.";
 
    // Rate limiting
    case errorCode.includes("too-many-requests") ||
      message.includes("too-many-requests"):
      return "Too many attempts. Please try again later.";
 
    // Permission or service issues
    case message.includes("permission") ||
      message.includes("insufficient"):
      return "Service temporarily unavailable. Please try again later.";
 
    // Fallback
    default:
      return "Invalid email or password.";
  }
}
//endregion Auth Error Message Helper
 
 