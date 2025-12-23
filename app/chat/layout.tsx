import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ChatProvider } from "@/context/ChatContext";
//region ChatLayout Component
/**
 * ChatLayout
 *
 * Layout wrapper for all chat-related pages.
 * - Provides global chat state via ChatProvider
 * - Catches and handles runtime errors using ErrorBoundary
 *
 * @param children - React nodes representing nested chat pages/components
 * @returns JSX.Element - Wrapped chat layout
 */
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //region Render
  /**
   * Wraps children with:
   * - ErrorBoundary for graceful error handling
   * - ChatProvider for shared chat state and actions
   */
  return (
    <ErrorBoundary>
      <ChatProvider>{children}</ChatProvider>
    </ErrorBoundary>
  );
  //endregion Render
}
//endregion ChatLayout Component
