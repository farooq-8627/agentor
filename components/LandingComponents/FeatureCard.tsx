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
        "group p-8 rounded-2xl border transition-all duration-700 card-hover",
        `bg-gradient-to-br from-${gradient.from} to-${gradient.to}`,
        `border-${borderColor} hover:border-${hoverBorderColor}`,
        className
      )}
      style={{
        willChange: "border-color",
        contain: "layout style paint",
        ...style,
      }}
    >
      <div className="flex flex-row align-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-700",
            `bg-${iconColor.replace("-400", "-500")}/20`
          )}
        >
          <Icon className={cn("w-6 h-6", `text-${iconColor}`)} />
        </div>

        <h3 className="text-xl font-semibold text-white mt-2">{title}</h3>
      </div>
      <div>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
});

FeatureCard.displayName = "FeatureCard";
