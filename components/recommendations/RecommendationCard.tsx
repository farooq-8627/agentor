"use client";

import React from "react";
import { Card, CardContent } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import {
  Recommendation,
  RecommendationSection,
} from "@/lib/recommendation-engine";
import {
  Star,
  MapPin,
  Users,
  TrendingUp,
  Zap,
  Building,
  Target,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { GlassCard } from "../UI/GlassCard";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  compact?: boolean;
}

interface RecommendationSectionCardProps {
  section: RecommendationSection;
  onRecommendationClick?: (recommendation: Recommendation) => void;
  maxItems?: number;
}

// Individual recommendation item component
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onRecommendationClick,
  compact = false,
}) => {
  const getTypeIcon = (type: Recommendation["type"]) => {
    switch (type) {
      case "agent":
        return <Users className="w-4 h-4" />;
      case "client":
        return <Building className="w-4 h-4" />;
      case "project":
        return <Target className="w-4 h-4" />;
      case "tool":
        return <Zap className="w-4 h-4" />;
      case "service":
        return <TrendingUp className="w-4 h-4" />;
      case "industry":
        return <Building className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Recommendation["type"]) => {
    switch (type) {
      case "agent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "client":
        return "bg-green-100 text-green-800 border-green-200";
      case "project":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "tool":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "service":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "industry":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <GlassCard onClick={() => onRecommendationClick?.(recommendation)}>
      <CardContent className={compact ? "p-0" : "p-0"}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={`${getTypeColor(recommendation.type)} text-xs font-medium`}
              >
                <span className="mr-1">{getTypeIcon(recommendation.type)}</span>
                {recommendation.type}
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium">
                {recommendation.matchScore}% match
              </Badge>
            </div>

            <h3
              className={`font-semibold text-gray-900 mb-1 ${
                compact ? "text-sm" : "text-base"
              }`}
            >
              {recommendation.title}
            </h3>

            <p
              className={`text-gray-600 mb-3 line-clamp-2 ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              {recommendation.description}
            </p>

            {/* Match reasons */}
            {!compact && recommendation.matchReasons.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {recommendation.matchReasons
                  .slice(0, 2)
                  .map((reason, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-700"
                    >
                      {reason}
                    </Badge>
                  ))}
                {recommendation.matchReasons.length > 2 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700"
                  >
                    +{recommendation.matchReasons.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            {/* Metadata */}
            {recommendation.metadata && (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {recommendation.metadata.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{recommendation.metadata.location}</span>
                  </div>
                )}
                {recommendation.metadata.budgetRange && (
                  <div className="flex items-center gap-1">
                    <span>Budget: {recommendation.metadata.budgetRange}</span>
                  </div>
                )}
                {recommendation.metadata.experienceLevel && (
                  <div className="flex items-center gap-1">
                    <span>{recommendation.metadata.experienceLevel}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </GlassCard>
  );
};

// Section card component (matches your wireframe design)
export const RecommendationSectionCard: React.FC<
  RecommendationSectionCardProps
> = ({ section, onRecommendationClick, maxItems = 3 }) => {
  const displayedRecommendations = section.recommendations.slice(0, maxItems);
  const hasMore = section.recommendations.length > maxItems;

  return (
    <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{section.icon}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h2>
              <p className="text-sm text-gray-600">{section.subtitle}</p>
            </div>
          </div>
          {hasMore && (
            <Button variant="ghost" className="text-blue-600 text-sm px-2 py-1">
              View All
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Recommendations list */}
        <div className="space-y-3">
          {displayedRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onRecommendationClick={onRecommendationClick}
              compact={true}
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => {
                // Handle view more action
                console.log("View more recommendations for:", section.title);
              }}
            >
              View {section.recommendations.length - maxItems} more
              recommendations
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
