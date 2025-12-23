import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "devextreme/dist/css/dx.light.css";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
// #region Metadata Configuration
/**
 * Global application metadata
 *
 * Applied to all routes in the application.
 * Used by Next.js for SEO and document head configuration.
 */
export const metadata: Metadata = {
  title: "AI Bot Platform",
  description: "AI-powered chatbot application",
};
// #endregion Metadata Configuration
// #region RootLayout Component
/**
 * RootLayout
 *
 * Top-level layout wrapper for the entire application.
 * - Provides global authentication context
 * - Wraps application with error boundary
 * - Renders persistent navigation bar
 * - Applies global styles and CSS imports
 *
 * @param children - All route-level page components
 * @returns JSX.Element - Root HTML layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // #region Render
  /**
   * Renders the root HTML and body structure
   */
  return (
    // #region HTML Structure
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {/* Global Navigation */}
            <Navbar />
            {/* Page Content */}
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
    // #endregion HTML Structure
  );
  // #endregion Render
}
// #endregion RootLayout Component