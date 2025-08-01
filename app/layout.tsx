import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Script from "next/script";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FloatingNavbar } from "@/components/Root/FloatingNavbar";
import { Toaster } from "@/components/UI/toaster";
import { PostProvider } from "@/lib/context/PostContext";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Fiverr",
  description: "Fiverr - Freelance Services Marketplace",
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const inter = Inter({ subsets: ["latin"] });

/**
 * This object can be customized to change Clerk's built-in appearance. To learn more: https://clerk.com/docs/customization/overview
 */
const clerkAppearanceObject = {
  variables: {
    colorPrimary: "#8b5cf6", // violet-500
    colorBackground: "#0f0f23", // dark background
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1aa", // zinc-400
    colorNeutral: "#18181b", // zinc-900
    colorInputBackground: "#27272a", // zinc-800
    colorInputText: "#ffffff",
    borderRadius: "0.75rem", // rounded-xl
    fontFamily: "system-ui, sans-serif",
    fontSize: "14px",
  },
  elements: {
    // Main card/container styling
    card: "bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-violet-500/20 shadow-2xl shadow-violet-500/10",
    headerTitle: "text-white font-semibold text-xl",
    headerSubtitle: "text-gray-300 text-sm",

    // Form elements
    formButtonPrimary:
      "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-violet-500/25 transition-all duration-200 border-0",
    formButtonSecondary:
      "bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white border border-gray-600/30 hover:border-violet-500/50 rounded-xl transition-all duration-200",

    // Input fields
    formFieldInput:
      "bg-gray-800/50 border border-gray-600/30 focus:border-violet-500/50 text-white placeholder:text-gray-400 rounded-xl focus:ring-2 focus:ring-violet-500/20",
    formFieldLabel: "text-gray-300 font-medium text-sm",

    // Social buttons
    socialButtonsBlockButton:
      "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-violet-500/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200",
    socialButtonsBlockButtonText: "font-medium text-sm",

    // Links and text
    formFieldAction: "text-violet-400 hover:text-violet-300 font-medium",
    identityPreviewEditButton: "text-violet-400 hover:text-violet-300",
    formResendCodeLink: "text-violet-400 hover:text-violet-300",

    // Footer and additional elements
    footerActionLink: "text-violet-400 hover:text-violet-300 font-medium",
    formFieldSuccessText: "text-green-400",
    formFieldErrorText: "text-red-400",

    // Navbar and navigation (for user management pages)
    navbar: "bg-gray-900/95 border-b border-gray-700/50",
    navbarButton:
      "text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg",

    // Dividers and separators
    dividerLine: "bg-gray-700/50",
    dividerText: "text-gray-400 text-sm",

    // Profile page specific
    profileSectionPrimaryButton:
      "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-xl",
    profileSectionContent:
      "bg-gray-800/30 border border-gray-700/50 rounded-xl",

    // Organization specific
    organizationSwitcherTrigger:
      "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-violet-500/50 text-gray-300 hover:text-white rounded-xl",

    // Alert and notification styling
    alertText: "text-gray-300",

    // Badge styling
    badge:
      "bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={clerkAppearanceObject}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.className} ${geistSans.variable} ${geistMono.variable} min-h-screen bg-black text-white relative overflow-x-hidden`}
          suppressHydrationWarning
        >
          {/* Premium Dark Background with Violet Theme */}
          <div className="fixed inset-0 z-0">
            {/* Base dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>

            {/* Violet accent gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/30 via-transparent to-violet-900/20"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-violet-950/10 to-purple-950/20"></div>

            {/* Animated gradient orbs for premium effect */}
            {/* <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div> */}
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl animate-pulse delay-500"></div>

            {/* Subtle dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            ></div>

            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: "100px 100px",
              }}
            ></div>
          </div>

          {/* Floating Navbar - Fixed to Viewport */}
          <FloatingNavbar />

          {/* Content */}
          <div className="relative z-10">
            <PostProvider>
              {children}
              <Toaster />
            </PostProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
