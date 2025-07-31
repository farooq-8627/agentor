"use client";
import React, { useState, useCallback } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  theme?: "light" | "dark";
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export function GlassCard({
  theme = "dark",
  children,
  className,
  padding = "p-6",
  ...props
}: GlassCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Use callbacks to prevent re-renders
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      className={cn("relative", className)}
      // Remove perspective as it's heavy during scroll
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="relative group">
        {/* Simplified hover glow - only show on hover */}
        {isHovered && (
          <motion.div
            className="absolute -inset-[1px] rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              willChange: "opacity",
            }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Static border - no animation */}
        <div className="absolute -inset-[0.5px] rounded-2xl border border-white/[0.1]" />

        {/* Optimized glass card background */}
        <div
          className={cn(
            "relative bg-black/80 backdrop-blur-xl rounded-2xl border border-white/[0.05] shadow-xl overflow-hidden",
            padding
          )}
          style={{
            // Use transform3d to enable hardware acceleration
            transform: "translate3d(0,0,0)",
            willChange: "transform",
          }}
        >
          {/* Removed heavy pattern overlay - too expensive during scroll */}

          {/* Content with hardware acceleration */}
          <div className="relative z-10" style={{ willChange: "auto" }}>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
