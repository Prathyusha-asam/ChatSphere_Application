export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unexpected error occurred. Please try again.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("user-not-found")) return "No account found with this email.";
  if (message.includes("wrong-password")) return "Incorrect email or password.";
  if (message.includes("invalid-email")) return "Please enter a valid email address.";
  if (message.includes("network")) return "Network issue. Check your connection.";
  if (message.includes("too-many-requests"))
    return "Too many attempts. Please try again later.";

  return "Something went wrong. Please try again.";
}
