import React, { useState } from "react";
import { Button } from "@/components/UI/button";
import { Pencil, Zap, Wrench } from "lucide-react";
import { GlassCard } from "@/components/UI/GlassCard";
import {
  groupExpertiseByCategory,
  getAutomationServiceInfo,
  getToolsExpertiseInfo,
} from "@/lib/expertise-utils";
import { AgentAutomationExpertiseEditModal } from "@/components/Dashboard/Edit/AgentProfile/AgentAutomationExpertiseEditModal";
import { cn } from "@/lib/utils";
import { Easing, motion, Variants } from "framer-motion";
import { ExpertiseItem } from "@/lib/expertise-utils";

interface ExpertiseCardProps {
  title: string;
  items: ExpertiseItem[];
  className?: string;
}

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2, // Reduced from 0.5
      ease: "easeOut", // Simpler easing
      staggerChildren: 0.05, // Reduced from 0.1
    },
  },
};

const itemChildVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15, // Reduced from 0.5
      ease: "easeOut", // Simpler easing
    },
  },
};

export function ExpertiseCard({ title, items, className }: ExpertiseCardProps) {
  return (
    <div className={cn("rounded-xl inline-block", className)}>
      <motion.div
        className="inline-flex flex-wrap gap-1 sm:gap-2"
        initial="hidden"
        whileInView="visible" // Changed from animate to whileInView
        variants={itemVariants}
        viewport={{ once: true, margin: "-50px" }} // Better viewport settings
        style={{ willChange: "opacity" }} // Optimize for opacity changes only
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.value}
              variants={itemChildVariants}
              className={cn(
                "group flex flex-row items-center gap-1 sm:gap-2 px-2 sm:px-2 py-1.5 sm:py-2 rounded-lg text-base",
                item.colors.bg,
                item.colors.border,
                item.colors.hover
              )}
              style={{
                willChange: "opacity",
                // Remove heavy transition, use CSS instead
                transition:
                  "background-color 0.2s ease, border-color 0.2s ease",
              }}
            >
              <div
                className={cn(
                  "p-1 sm:p-2 rounded-md shrink-0",
                  item.colors.bg,
                  item.colors.border
                )}
                style={{
                  // Optimize transform for better performance
                  willChange: "transform",
                  transition: "transform 0.15s ease",
                }}
              >
                <Icon
                  className={cn("w-3 h-3 sm:w-4 sm:h-4", item.colors.text)}
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-medium truncate text-sm sm:text-base",
                    item.colors.text
                  )}
                >
                  {item.title}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// Component for displaying grouped expertise items
interface GroupedExpertiseProps {
  title: string;
  groups: [string, ExpertiseItem[]][];
  className?: string;
  type: "services" | "tools";
}

export function GroupedExpertise({
  title,
  groups,
  className,
  type,
}: GroupedExpertiseProps) {
  const Icon = type === "services" ? Zap : Wrench;
  const iconColor = type === "services" ? "text-violet-400" : "text-indigo-400";

  return (
    <div className={cn("space-y-1 sm:space-y-2", className)}>
      <div className="flex flex-row items-center justify-between ">
        <h2 className="text-sm sm:text-base font-semibold text-violet-200 flex items-center">
          <Icon
            className={`inline-block mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`}
          />
          {title}
        </h2>
      </div>
      <div className="flex flex-row gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {groups.map(([category, items]) => (
          <ExpertiseCard
            key={category}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            items={items}
          />
        ))}
      </div>
    </div>
  );
}

interface AgentAutomationCardProps {
  automationExpertise: {
    automationServices: string[];
    toolsExpertise: string[];
  };
  isCurrentUser?: boolean;
  profileId: string;
}

export function AgentAutomationCard({
  automationExpertise,
  isCurrentUser,
  profileId,
}: AgentAutomationCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentExpertise, setCurrentExpertise] = useState(automationExpertise);

  const handleExpertiseUpdate = (data: {
    automationServices: string[];
    toolsExpertise: string[];
  }) => {
    setCurrentExpertise({
      automationServices: data.automationServices,
      toolsExpertise: data.toolsExpertise,
    });
  };

  return (
    <>
      <GlassCard>
        <div className="md:px-6 py-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Automation Expertise</h2>
            {isCurrentUser && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 w-8 p-0 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <Pencil className="h-4 w-4 text-white" />
              </Button>
            )}
          </div>

          {/* Services Section */}
          <GroupedExpertise
            title="Automation Services"
            groups={groupExpertiseByCategory(
              [...currentExpertise.automationServices],
              getAutomationServiceInfo
            )}
            className="mb-8"
            type="services"
          />

          {/* Tools Section */}
          <GroupedExpertise
            title="Tools & Platforms"
            groups={groupExpertiseByCategory(
              [...currentExpertise.toolsExpertise],
              getToolsExpertiseInfo
            )}
            type="tools"
          />
        </div>
      </GlassCard>

      <AgentAutomationExpertiseEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          profileId,
          automationServices: currentExpertise.automationServices,
          toolsExpertise: currentExpertise.toolsExpertise,
        }}
        isCurrentUser={isCurrentUser ?? false}
        onExpertiseUpdate={handleExpertiseUpdate}
      />
    </>
  );
}
