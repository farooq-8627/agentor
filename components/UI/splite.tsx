"use client";

import React, {
  Suspense,
  lazy,
  useState,
  useRef,
  useEffect,
  memo,
} from "react";

// Lazy load Spline with better chunking
const Spline = lazy(() =>
  import("@splinetool/react-spline").then((module) => ({
    default: module.default,
  }))
);

interface SplineSceneProps {
  scene: string;
  className?: string;
  lowPerformanceMode?: boolean;
  priority?: boolean;
}

// Loading skeleton component
const SplineLoader = memo(() => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-2xl">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500/40 rounded-full animate-spin animate-reverse"
          style={{ animationDelay: "150ms" }}
        />
      </div>
      <div className="text-sm text-gray-400 animate-pulse">
        Loading 3D Scene...
      </div>
    </div>
  </div>
));

SplineLoader.displayName = "SplineLoader";

// Error fallback component
const SplineError = memo(() => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-2xl border border-red-500/10">
    <div className="text-center text-gray-400 p-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-sm">3D Scene temporarily unavailable</p>
      <p className="text-xs mt-2 opacity-60">
        Experiencing high performance mode
      </p>
    </div>
  </div>
));

SplineError.displayName = "SplineError";

export const SplineScene = memo(function SplineScene({
  scene,
  className,
  lowPerformanceMode = false,
  priority = false,
}: SplineSceneProps) {
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return; // Skip intersection observer if priority loading

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Performance monitoring
  useEffect(() => {
    if (isLoaded) {
      // Mark performance milestone
      performance.mark("spline-loaded");
    }
  }, [isLoaded]);

  const handleSplineLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleSplineError = () => {
    setHasError(true);
    console.warn("Spline scene failed to load, falling back to placeholder");
  };

  // Don't render Spline in low performance mode
  if (lowPerformanceMode || hasError) {
    return (
      <div ref={containerRef} className={className}>
        <SplineError />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        contain: "layout style paint",
        willChange: isIntersecting ? "contents" : "auto",
      }}
    >
      {isIntersecting ? (
        <Suspense fallback={<SplineLoader />}>
          <ErrorBoundary fallback={SplineError}>
            <Spline
              scene={scene}
              style={{
                width: "100%",
                height: "100%",
                willChange: "transform",
              }}
              onLoad={handleSplineLoad}
              onError={handleSplineError}
            />
          </ErrorBoundary>
        </Suspense>
      ) : (
        <SplineLoader />
      )}
    </div>
  );
});

// Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback: React.ComponentType;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Spline Error Boundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      return <Fallback />;
    }

    return this.props.children;
  }
}
