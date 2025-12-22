export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unexpected error occurred. Please try again.";
  }

  const errorCode = (error as any).code || "";
  const message = error.message.toLowerCase();

  if (errorCode.includes("invalid-email") || message.includes("invalid-email")) 
    return "Invalid email.";
  if (errorCode.includes("wrong-password") || message.includes("wrong-password")) 
    return "Invalid password.";
  if (errorCode.includes("user-not-found") || message.includes("user-not-found")) 
    return "Invalid email.";
  if (errorCode.includes("network-request-failed") || message.includes("network")) 
    return "Network issue. Check your connection.";
  if (errorCode.includes("too-many-requests") || message.includes("too-many-requests"))
    return "Too many attempts. Please try again later.";
  if (message.includes("permission") || message.includes("insufficient"))
    return "Service temporarily unavailable. Please try again later.";

  return "Invalid email or password.";
}
