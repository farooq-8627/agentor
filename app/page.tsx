"use client";

import React, { memo, useState, useEffect, useMemo } from "react";
import { SplineScene } from "@/components/UI/splite";
import { FeatureCard } from "@/components/LandingComponents/FeatureCard";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useScrollOptimization } from "@/hooks/useScrollOptimization";

// Performance detection hook
function usePerformanceMode() {
  const [lowPerformanceMode, setLowPerformanceMode] = useState(false);

  useEffect(() => {
    // Check device capabilities
    const checkPerformance = () => {
      const isLowEnd =
        navigator.hardwareConcurrency <= 2 ||
        ("connection" in navigator &&
          (navigator.connection as any)?.effectiveType === "slow-2g");

      setLowPerformanceMode(isLowEnd);
    };

    checkPerformance();
  }, []);

  return lowPerformanceMode;
}

// Memoized feature data
const FEATURES_DATA = [
  {
    icon: Users,
    title: "Expert Network",
    description:
      "Connect with verified automation specialists, AI engineers, and industry experts who can bring your vision to life.",
    gradient: { from: "purple-500/10", to: "indigo-500/10" },
    iconColor: "purple-400",
    borderColor: "purple-500/20",
    hoverBorderColor: "purple-400/40",
  },
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description:
      "Our intelligent algorithm analyzes your requirements and matches you with the perfect experts and solutions for your project.",
    gradient: { from: "purple-500/10", to: "indigo-500/10" },
    iconColor: "purple-400",
    borderColor: "purple-500/20",
    hoverBorderColor: "purple-400/40",
  },
  {
    icon: Target,
    title: "Smart Recommendations",
    description:
      "Get personalized recommendations for tools, services, and experts based on your industry, goals, and previous successful projects.",
    gradient: { from: "purple-500/10", to: "indigo-500/10" },
    iconColor: "purple-400",
    borderColor: "purple-500/20",
    hoverBorderColor: "purple-400/40",
  },
  {
    icon: CheckCircle,
    title: "Verified Professionals",
    description:
      "All experts are thoroughly vetted with verified credentials, portfolios, and client reviews to ensure quality and reliability.",
    gradient: { from: "purple-500/10", to: "indigo-500/10" },
    iconColor: "purple-400",
    borderColor: "purple-500/20",
    hoverBorderColor: "purple-400/40",
  },
  {
    icon: Sparkles,
    title: "Innovation Hub",
    description:
      "Stay ahead with access to cutting-edge AI tools, emerging technologies, and industry insights from thought leaders.",
    gradient: { from: "purple-500/10", to: "indigo-500/10" },
    iconColor: "purple-400",
    borderColor: "purple-500/20",
    hoverBorderColor: "purple-400/40",
  },
  {
    icon: ArrowRight,
    title: "Seamless Integration",
    description:
      "Integrate seamlessly with your existing workflows and tools through our comprehensive API and plugin ecosystem.",
    gradient: { from: "purple-500/10", to: "indigo-500/10" },
    iconColor: "purple-400",
    borderColor: "purple-500/20",
    hoverBorderColor: "purple-400/40",
  },
] as const;

// Memoized Steps Component
const StepsSection = memo(() => (
  <div className="grid lg:grid-cols-3 gap-8">
    {[
      {
        number: 1,
        title: "Define Your Needs",
        description:
          "Tell us about your automation goals, industry requirements, and project scope. Our AI analyzes your needs to find the perfect matches.",
        gradient: "from-violet-500 to-purple-500",
      },
      {
        number: 2,
        title: "Connect & Collaborate",
        description:
          "Browse curated recommendations, review expert profiles, and connect with verified professionals who match your specific requirements.",
        gradient: "from-purple-500 to-indigo-500",
      },
      {
        number: 3,
        title: "Launch & Scale",
        description:
          "Work together to build, deploy, and scale your automation solutions. Track progress and measure success with built-in analytics.",
        gradient: "from-indigo-500 to-violet-500",
      },
    ].map((step, index) => (
      <div key={step.number} className="text-center group">
        <div className="relative mb-8">
          <div
            className={`w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}
          >
            <span className="text-2xl font-bold text-white">{step.number}</span>
          </div>
          {index < 2 && (
            <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent hidden lg:block" />
          )}
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
        <p className="text-gray-300 text-lg">{step.description}</p>
      </div>
    ))}
  </div>
));

StepsSection.displayName = "StepsSection";

// Memoized Hero Content
const HeroContent = memo(({ isSignedIn }: { isSignedIn: boolean }) => (
  <div className="text-center lg:text-left space-y-8">
    <div className="space-y-6">
      <Badge
        variant="secondary"
        className="bg-violet-500/10 text-violet-300 border-violet-500/20 fade-in-optimized"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        AI-Powered Automation Platform
      </Badge>

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
        <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Connect with
        </span>
        <br />
        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          AI Automation
        </span>
        <br />
        <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
          Experts
        </span>
      </h1>

      <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
        Join the world&apos;s largest platform connecting businesses with
        verified AI automation specialists. Transform your operations with
        cutting-edge solutions.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
      {isSignedIn ? (
        <Link href="/feed">
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 group px-8 py-4 text-lg">
            Explore Platform
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      ) : (
        <Link href="/sign-up">
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 group px-8 py-4 text-lg">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}

      <Link href="/agents">
        <Button
          variant="outline"
          className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 px-8 py-4 text-lg"
        >
          Browse Experts
        </Button>
      </Link>
    </div>

    <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
      <div className="text-center">
        <div className="text-2xl font-bold text-white">10K+</div>
        <div className="text-sm text-gray-400">Active Experts</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-white">50K+</div>
        <div className="text-sm text-gray-400">Projects Completed</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-white">99%</div>
        <div className="text-sm text-gray-400">Success Rate</div>
      </div>
    </div>
  </div>
));

HeroContent.displayName = "HeroContent";

export default function Home() {
  const { isSignedIn } = useUser();
  const lowPerformanceMode = usePerformanceMode();

  // Use scroll optimization
  useScrollOptimization({
    throttleMs: 16,
    enableRAF: true,
    disablePointerEvents: false, // Keep interactions enabled
  });

  // Memoize features to prevent re-renders
  const memoizedFeatures = useMemo(
    () =>
      FEATURES_DATA.map((feature) => (
        <FeatureCard
          key={feature.title}
          {...feature}
          className="fade-in-optimized"
        />
      )),
    []
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden scroll-container"
      style={{ contain: "layout style" }}
    >
      {/* Optimized Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-violet-900/30">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
      </div>

      {/* Lightweight animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="order-1 lg:order-1">
              <HeroContent isSignedIn={isSignedIn ?? false} />
            </div>

            {/* Right Side - Optimized Robot Animation */}
            <div className="order-2 lg:order-2 relative lg:h-screen flex items-center justify-center">
              <div className="w-full h-[400px] md:h-[600px] lg:h-[700px] relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-3xl blur-3xl" />
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full relative z-10"
                  lowPerformanceMode={lowPerformanceMode}
                  priority={true}
                />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-10 md:top-20 right-4 md:right-10 bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-3 md:p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs md:text-sm text-gray-300">
                    AI Active
                  </span>
                </div>
              </div>

              <div className="absolute bottom-20 md:bottom-32 left-4 md:left-10 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-3 md:p-4">
                <div className="text-xs md:text-sm text-gray-300">
                  <div className="font-semibold">Smart Matching</div>
                  <div className="text-xs text-gray-400">98% accuracy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-violet-500/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-violet-400 rounded-full mt-2 animate-bounce" />
        </div>
      </div>

      {/* Features Section */}
      <section className="relative z-10 py-16 md:py-24 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Succeed in AI Automation
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform connects you with the right experts,
              tools, and opportunities to accelerate your automation journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {memoizedFeatures}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4"
            >
              <Target className="w-4 h-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get Started in
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Three Simple Steps
              </span>
            </h2>
          </div>

          <StepsSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 md:py-24 bg-gradient-to-r from-violet-500/10 to-purple-500/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Automation Journey?
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already building the future
            with AI-powered automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Link href="/feed">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 group px-8 py-4 text-lg">
                  Start Building Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 group px-8 py-4 text-lg">
                  Join the Platform
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
