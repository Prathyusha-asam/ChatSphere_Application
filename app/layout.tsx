import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "devextreme/dist/css/dx.light.css";

// #region Metadata Configuration
// Global metadata applied to all pages in the application
export const metadata: Metadata = {
  title: "AI Bot Platform",
  description: "AI-powered chatbot application",
};
// #endregion Metadata Configuration

// #region Root Layout Component
// Wraps all route-level pages and provides a consistent layout structure
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // #region HTML Structure
    <html lang="en">
      <body>
        <AuthProvider>
          {/* Global Navigation */}
          <Navbar />
          {/* Page Content */}
          {children}
        </AuthProvider>
      </body>
    </html>
    // #endregion HTML Structure
  );
}
// #endregion Root Layout Component