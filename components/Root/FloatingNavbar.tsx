"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  UserSquare2,
  Newspaper,
  User,
  Building2,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback, useMemo } from "react";

// Optimized navigation items with preloading hints
const navigationItems = [
  {
    icon: Home,
    label: "Home",
    href: "/",
  },
  {
    icon: UserSquare2,
    label: "Agents",
    href: "/agents",
  },
  {
    icon: Users,
    label: "Clients",
    href: "/clients",
  },
  {
    icon: Building2,
    label: "Companies",
    href: "/companies",
  },
  {
    icon: Newspaper,
    label: "Feed",
    href: "/feed",
  },
  {
    icon: MessageCircle,
    label: "Chat",
    href: "/messaging",
  },
  {
    icon: User,
    label: "Dashboard",
    href: "/dashboard",
  },
] as const;

export function FloatingNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navbarRef = React.useRef<HTMLDivElement>(null);
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Single effect for initialization
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show navbar on specific pages
  const shouldHideNavbar = useMemo(() => {
    if (!pathname) return false;
    return (
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/user-details") ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up")
    );
  }, [pathname]);

  // Optimized active item check
  const isActiveItem = useCallback(
    (href: string, label: string) => {
      if (!pathname) return false;
      if (href === "/" && pathname === "/") return true;
      if (href !== "/" && pathname.startsWith(href)) return true;
      if (label === "Dashboard" && pathname.startsWith("/dashboard"))
        return true;
      return false;
    },
    [pathname]
  );

  // Optimized navigation handler with instant routing
  const handleNavigation = useCallback(
    (href: string, label: string, e?: React.MouseEvent) => {
      e?.preventDefault();

      // Handle dashboard routing with username
      if (href === "/dashboard" && user) {
        const username =
          user.username || user.primaryEmailAddress?.emailAddress.split("@")[0];
        if (!username) {
          router.push("/sign-in");
          return;
        }
        router.push(`/dashboard/${username}`);
        setIsExpanded(false);
        return;
      }

      // Use router.push for instant navigation
      router.push(href);
      setIsExpanded(false);
    },
    [user, router]
  );

  // Close when clicking outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  if (shouldHideNavbar || !mounted) {
    return null;
  }

  return (
    <div
      ref={navbarRef}
      className="fixed top-1/2 right-2 sm:right-4 -translate-y-1/2 z-[9998] transition-all duration-300 ease-out"
    >
      {/* Menu Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "bg-black/95 backdrop-blur-xl border border-violet-500/20 rounded-full",
          "flex items-center justify-center transition-all duration-300 ease-out",
          "hover:bg-violet-600/20 hover:border-violet-400/50",
          "shadow-2xl shadow-violet-500/10 w-12 h-12",
          isExpanded && "bg-violet-600/30 border-violet-400/60 scale-110"
        )}
        aria-label={isExpanded ? "Close menu" : "Open menu"}
      >
        <div className="w-5 h-5 relative">
          <Menu
            className={cn(
              "absolute inset-0 w-5 h-5 text-violet-300 transition-all duration-300",
              isExpanded
                ? "opacity-0 rotate-90 scale-75"
                : "opacity-100 rotate-0 scale-100"
            )}
          />
          <X
            className={cn(
              "absolute inset-0 w-5 h-5 text-violet-300 transition-all duration-300",
              isExpanded
                ? "opacity-100 rotate-0 scale-100"
                : "opacity-0 rotate-90 scale-75"
            )}
          />
        </div>
      </button>

      {/* Expanded Navbar */}
      {isExpanded && (
        <div className="absolute top-1/2 right-16 -translate-y-1/2 transition-all duration-300 ease-out">
          <div
            className={cn(
              "relative bg-black/95 backdrop-blur-xl border border-violet-500/20 rounded-3xl shadow-2xl",
              "transition-all duration-300 ease-out overflow-hidden",
              "w-fit min-w-[3rem] max-h-[80vh]",
              "animate-in fade-in-0 slide-in-from-right-2 duration-300 w-52"
            )}
          >
            {/* Navigation Items */}
            <div className="p-3 space-y-1 max-h-[50vh] overflow-y-auto scrollbar-hide">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveItem(item.href, item.label);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, item.label, e)}
                    className={cn(
                      "group relative flex items-center transition-all duration-200",
                      "hover:bg-violet-500/10 hover:scale-[1.02] hover:shadow-lg rounded-xl",
                      isActive
                        ? "bg-violet-500/20 text-violet-300 shadow-lg border border-violet-500/30"
                        : "text-gray-300 hover:text-white",
                      "space-x-3 p-3"
                    )}
                    prefetch={true}
                  >
                    <Icon
                      className={cn(
                        "transition-all duration-200 flex-shrink-0",
                        isActive
                          ? "text-violet-400"
                          : "text-gray-400 group-hover:text-white",
                        "w-5 h-5"
                      )}
                    />
                    <span className="font-medium text-sm">{item.label}</span>

                    {isActive && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-violet-400 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Auth Section */}
            <div className="border-t border-gray-700/50 p-3">
              {isSignedIn ? (
                <div className="flex items-center bg-gray-800/30 rounded-xl space-x-3 p-3">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: "bg-gray-900 border-gray-700",
                        userButtonPopoverActionButton:
                          "text-gray-200 hover:text-white",
                      },
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {user?.firstName || "User"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <SignInButton mode="modal">
                    <button className="w-full text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors border border-gray-600/30 hover:border-gray-500/50 px-4 py-2">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-sm rounded-lg transition-all duration-200 shadow-lg font-medium px-4 py-2">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>

            {/* Logo/Brand */}
            <div className="border-t border-gray-700/50 p-3">
              <Link
                href="/"
                className="group flex items-center hover:bg-gray-800/30 rounded-xl transition-colors space-x-3 p-3"
                onClick={(e) => handleNavigation("/", "Home", e)}
              >
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg w-8 h-8">
                  <span className="text-white font-bold text-base">A</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                    Agentor
                  </span>
                  <p className="text-xs text-gray-400">AI Platform</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
