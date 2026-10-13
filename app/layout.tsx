import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import "./marketing.css";
import "./account.css";
import {LanguageProvider} from './components/Language';

export const metadata: Metadata = {
  title: "Fuison Commerce — Your Brand Deserves Its Own Store",
  description: "Fuison Commerce is a Bangladeshi commerce platform in development. Explore branded storefronts and a simpler merchant workspace in Bangla and English.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className="antialiased"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
