import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Course Evaluation · Uganda Martyrs University",
    template: "%s · UMU Quality Assurance",
  },
  description:
    "A student-centred course evaluation experience for Uganda Martyrs University. One question at a time, or in your own words.",
  icons: {
    icon: "/umu-logo.png",
    apple: "/umu-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#CC0000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only z-[100] rounded-xl bg-umu-red px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
