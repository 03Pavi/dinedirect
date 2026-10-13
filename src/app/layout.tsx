
import type { Metadata } from "next";
import StoreProvider from "@/app/providers/store-provider";
import AppThemeProvider from "@/app/providers/theme-provider";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Next project",
  description: "A Sample Next.js project with scalable modular structure",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <StoreProvider>
          <AppThemeProvider>
            {children}
          </AppThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
