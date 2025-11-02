import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "InvoIQ - AI-Powered Invoice Management",
    template: "%s | InvoIQ",
  },
  description: "Save hours of manual data entry. InvoIQ uses AI to extract invoice details from images and text, then helps you manage clients and get paid faster.",
  keywords: [
    "AI invoice",
    "invoice management",
    "invoice generator",
    "invoice extraction",
    "AI-powered invoicing",
    "client management",
    "payment tracking",
    "invoice OCR",
    "automated invoicing",
    "freelance invoicing",
  ],
  authors: [{ name: "Devchi Digital" }],
  creator: "Devchi",
  publisher: "InvoIQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "InvoIQ - AI-Powered Invoice Management",
    description:
      "Extract invoice data instantly with AI. Save hours of manual data entry and get paid faster.",
    url: "/",
    siteName: "InvoIQ",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "InvoIQ - AI-Powered Invoice Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoIQ - AI-Powered Invoice Management",
    description:
      "Extract invoice data instantly with AI. Save hours of manual data entry and get paid faster.",
    images: ["/og-image.png"],
    creator: "@devchijay",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
