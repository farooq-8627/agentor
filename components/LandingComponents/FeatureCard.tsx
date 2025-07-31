"use client";

import React, { memo } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: {
    from: string;
    to: string;
  };
  iconColor?: string;
  borderColor?: string;
  hoverBorderColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = { from: "violet-500/10", to: "purple-500/10" },
  iconColor = "violet-400",
  borderColor = "violet-500/20",
  hoverBorderColor = "violet-400/40",
  className,
  style,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group p-8 rounded-2xl border transition-all duration-300 hover:scale-105 card-hover",
        `bg-gradient-to-br from-${gradient.from} to-${gradient.to}`,
        `border-${borderColor} hover:border-${hoverBorderColor}`,
        className
      )}
      style={{
        willChange: "transform, border-color",
        contain: "layout style paint",
        ...style,
      }}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
          `bg-${iconColor.replace("-400", "-500")}/20`
        )}
        style={{ willChange: "transform" }}
      >
        <Icon className={cn("w-6 h-6", `text-${iconColor}`)} />
      </div>

      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>

      <p className="text-gray-300">{description}</p>
    </div>
  );
});

FeatureCard.displayName = "FeatureCard";
