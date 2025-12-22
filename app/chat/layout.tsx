import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ChatProvider } from "@/context/ChatContext";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ChatProvider>{children}</ChatProvider>
    </ErrorBoundary>
  );
}
