"use client";

import { Navbar } from "@/components/Root/Navbar";
import { SplineScene } from "@/components/UI/splite";
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

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Premium Violet Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-violet-900/30">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
      </div>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Platform
                </Badge>

                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-violet-200 to-purple-300 bg-clip-text text-transparent">
                    Architecture For AI
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Influence Engine
                  </span>
                  <br />
                  <span className="text-4xl lg:text-5xl text-gray-300">
                    For Lasting Impact
                  </span>
                </h1>

                <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                  Connect with top automation experts, discover cutting-edge AI
                  solutions, and build the future of intelligent automation.
                  Join the premier platform where innovation meets expertise.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-400" />
                  </div>
                  <span>Expert Network</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <span>AI-Powered Matching</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span>Smart Recommendations</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-violet-400" />
                  </div>
                  <span>Verified Professionals</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
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
                      Join Waitlist
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}

                <Button
                  variant="outline"
                  className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-400/50 backdrop-blur-sm px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 pt-8 border-t border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm text-gray-400">Expert Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1000+</div>
                  <div className="text-sm text-gray-400">
                    Projects Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Side - Robot Animation */}
            <div className="relative lg:h-screen flex items-center justify-center">
              <div className="w-full h-[600px] lg:h-[700px] relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full relative z-10"
                />
              </div>

              {/* Floating Elements */}
              <div className="absolute top-20 right-10 bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">AI Active</span>
                </div>
              </div>

              <div className="absolute bottom-32 left-10 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4">
                <div className="text-sm text-gray-300">
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
      <section className="relative z-10 py-24 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Succeed in AI Automation
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform connects you with the right experts,
              tools, and opportunities to accelerate your automation journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-400/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Expert Network
              </h3>
              <p className="text-gray-300">
                Connect with verified automation specialists, AI engineers, and
                industry experts who can bring your vision to life.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                AI-Powered Matching
              </h3>
              <p className="text-gray-300">
                Our intelligent algorithm analyzes your requirements and matches
                you with the perfect experts and solutions for your project.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 hover:border-indigo-400/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Smart Recommendations
              </h3>
              <p className="text-gray-300">
                Get personalized recommendations for tools, services, and
                experts based on your industry, goals, and previous successful
                projects.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-400/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Verified Professionals
              </h3>
              <p className="text-gray-300">
                All experts are thoroughly vetted with verified credentials,
                portfolios, and client reviews to ensure quality and
                reliability.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Innovation Hub
              </h3>
              <p className="text-gray-300">
                Stay ahead with access to cutting-edge AI tools, emerging
                technologies, and industry insights from thought leaders.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 hover:border-indigo-400/40 transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Seamless Integration
              </h3>
              <p className="text-gray-300">
                Integrate seamlessly with your existing workflows and tools
                through our comprehensive API and plugin ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4"
            >
              <Target className="w-4 h-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get Started in
              </span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Three Simple Steps
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent hidden lg:block" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Define Your Needs
              </h3>
              <p className="text-gray-300 text-lg">
                Tell us about your automation goals, industry requirements, and
                project scope. Our AI analyzes your needs to find the perfect
                matches.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent hidden lg:block" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Connect & Collaborate
              </h3>
              <p className="text-gray-300 text-lg">
                Browse curated recommendations, review expert profiles, and
                connect with verified professionals who match your specific
                requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Launch & Scale
              </h3>
              <p className="text-gray-300 text-lg">
                Work together to build, deploy, and scale your automation
                solutions. Track progress and measure success with built-in
                analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-r from-violet-500/10 to-purple-500/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Automation Journey?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
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
