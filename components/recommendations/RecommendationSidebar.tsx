"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import { GlassCard } from "@/components/UI/GlassCard";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import {
  RecommendationEngine,
  UserRecommendations,
  Recommendation,
} from "@/lib/recommendation-engine";
import { useUser } from "@/hooks/useUser";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import {
  Users,
  Building,
  Zap,
  TrendingUp,
  Target,
  Star,
  MapPin,
  ChevronRight,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Flame,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Shared recommendation context for sync across pages
const RecommendationContext = createContext<{
  recommendations: UserRecommendations | null;
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => void;
} | null>(null);

// Global recommendation store
let globalRecommendations: UserRecommendations | null = null;
let globalLoading = false;
let globalError: string | null = null;
const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  subscribers.forEach((callback) => callback());
};

interface RecommendationSidebarProps {
  className?: string;
  maxItemsPerSection?: number;
  showHeader?: boolean;
  loading?: boolean; // Add loading prop to sync with parent
}

// Custom hook to manage global recommendations
const useGlobalRecommendations = (userForRecommendations: any) => {
  const [localRecommendations, setLocalRecommendations] =
    useState<UserRecommendations | null>(globalRecommendations);
  const [localLoading, setLocalLoading] = useState(globalLoading);
  const [localError, setLocalError] = useState<string | null>(globalError);

  useEffect(() => {
    const updateLocal = () => {
      setLocalRecommendations(globalRecommendations);
      setLocalLoading(globalLoading);
      setLocalError(globalError);
    };

    subscribers.add(updateLocal);
    return () => {
      subscribers.delete(updateLocal);
    };
  }, []);

  const loadGlobalRecommendations = useCallback(async () => {
    if (!userForRecommendations || globalLoading) {
      return;
    }

    try {
      globalLoading = true;
      globalError = null;
      notifySubscribers();

      const recommendations =
        await RecommendationEngine.generateRecommendations(
          userForRecommendations
        );
      globalRecommendations = recommendations;
      globalLoading = false;
      notifySubscribers();
    } catch (error) {
      globalError =
        error instanceof Error
          ? error.message
          : "Failed to load recommendations";
      globalLoading = false;
      notifySubscribers();
    }
  }, [userForRecommendations]);

  const refreshGlobalRecommendations = useCallback(async () => {
    globalRecommendations = null; // Clear cache to force fresh load
    await loadGlobalRecommendations();
  }, [loadGlobalRecommendations]);

  return {
    recommendations: localRecommendations,
    loading: localLoading,
    error: localError,
    loadRecommendations: loadGlobalRecommendations,
    refreshRecommendations: refreshGlobalRecommendations,
  };
};

export const RecommendationSidebar: React.FC<RecommendationSidebarProps> =
  React.memo(
    ({
      className = "",
      maxItemsPerSection = 4,
      showHeader = true,
      loading: externalLoading = false,
    }) => {
      const { user: currentUser } = useUser();
      const { agentProfiles, clientProfiles } = useUserProfiles();
      const [isSticky, setIsSticky] = useState(false);
      const sidebarRef = useRef<HTMLDivElement>(null);
      const router = useRouter();

      // Memoized user data transformation
      const userForRecommendations = useMemo(() => {
        if (!currentUser) return null;

        return {
          _id: currentUser._id,
          hasAgentProfile: (agentProfiles?.length || 0) > 0,
          hasClientProfile: (clientProfiles?.length || 0) > 0,
          agentProfiles: agentProfiles?.map((profile) => ({
            _id: profile._id,
            automationExpertise: profile.automationExpertise,
            businessDetails: profile.businessDetails,
          })),
          clientProfiles: clientProfiles?.map((profile) => ({
            _id: profile._id,
            automationNeeds: profile.automationNeeds,
          })),
          profileDetails: currentUser.profileDetails,
          companies: currentUser.companies,
        };
      }, [currentUser, agentProfiles, clientProfiles]);

      // Use global recommendations hook
      const {
        recommendations,
        loading: internalLoading,
        error,
        loadRecommendations,
        refreshRecommendations,
      } = useGlobalRecommendations(userForRecommendations);

      // Combined loading state
      const isLoading = externalLoading || internalLoading;

      // Load recommendations on mount
      useEffect(() => {
        if (userForRecommendations && !globalRecommendations) {
          loadRecommendations();
        }
      }, [userForRecommendations, loadRecommendations]);

      // Enhanced refresh function
      const handleRefresh = useCallback(() => {
        refreshRecommendations();
      }, [refreshRecommendations]);

      // Memoized scroll handler to prevent recreation
      const handleScroll = useCallback(() => {
        if (!sidebarRef.current) return;

        const sidebarElement = sidebarRef.current;
        const sidebarRect = sidebarElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const sidebarHeight = sidebarElement.offsetHeight;
        const scrollY = window.scrollY;

        // More sophisticated sticky logic
        const topThreshold = viewportHeight * 0.25; // When to start considering sticky (25% from top)
        const maxSidebarHeight = viewportHeight * 0.75; // Maximum height for sidebar to be sticky

        // Conditions for sticky behavior:
        // 1. Sidebar top is at or above the threshold
        // 2. Sidebar height is reasonable (not too tall)
        // 3. User has scrolled past initial content
        const shouldBeSticky =
          sidebarRect.top <= topThreshold &&
          sidebarHeight <= maxSidebarHeight &&
          scrollY > 100; // Only after scrolling past header area

        setIsSticky(shouldBeSticky);
      }, []); // No dependencies - this logic doesn't change

      // Enhanced scroll behavior - only run when recommendations are loaded
      useEffect(() => {
        // Only add scroll listener when we have recommendations (content is stable)
        if (!recommendations || isLoading) return;

        // Throttle scroll events for better performance
        let ticking = false;
        const throttledHandleScroll = () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              handleScroll();
              ticking = false;
            });
            ticking = true;
          }
        };

        // Add scroll listener with throttling
        window.addEventListener("scroll", throttledHandleScroll, {
          passive: true,
        });

        // Initial check
        handleScroll();

        // Cleanup
        return () => {
          window.removeEventListener("scroll", throttledHandleScroll);
        };
      }, [recommendations, isLoading, handleScroll]); // Only re-run when recommendations load/change

      const handleRecommendationClick = (recommendation: Recommendation) => {
        switch (recommendation.type) {
          case "agent":
            if (recommendation.metadata?.username) {
              router.push(`/dashboard/${recommendation.metadata.username}`);
            } else if (recommendation.metadata?.profileId) {
              router.push(`/agents/${recommendation.metadata.profileId}`);
            }
            break;
          case "client":
            if (recommendation.metadata?.username) {
              router.push(`/dashboard/${recommendation.metadata.username}`);
            } else if (recommendation.metadata?.profileId) {
              router.push(`/clients/${recommendation.metadata.profileId}`);
            }
            break;
          case "company":
            if (recommendation.metadata?.companyId) {
              router.push(`/companies/${recommendation.metadata.companyId}`);
            }
            break;
          default:
            // Fallback for other types
            router.push(
              `/feed?search=${encodeURIComponent(recommendation.title)}`
            );
            break;
        }
      };

      const getTypeIcon = (type: Recommendation["type"]) => {
        switch (type) {
          case "agent":
            return <Users className="w-4 h-4" />;
          case "client":
            return <Building className="w-4 h-4" />;
          case "company":
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
            return "bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400";
          case "client":
            return "bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400";
          case "company":
            return "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-400";
          case "project":
            return "bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400";
          case "tool":
            return "bg-gradient-to-br from-orange-500/20 to-yellow-500/20 text-orange-400";
          case "service":
            return "bg-gradient-to-br from-pink-500/20 to-rose-500/20 text-pink-400";
          case "industry":
            return "bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-indigo-400";
          default:
            return "bg-gradient-to-br from-gray-500/20 to-slate-500/20 text-gray-400";
        }
      };

      const getSectionIcon = (sectionTitle: string) => {
        switch (sectionTitle) {
          case "Perfect Matches":
          case "Best Matches":
            return <Target className="w-4 h-4 text-blue-400" />;
          case "Trending Now":
          case "Popular Now":
            return <Flame className="w-4 h-4 text-orange-400" />;
          case "Explore More":
          case "New Ideas":
            return <Search className="w-4 h-4 text-purple-400" />;
          default:
            return <Sparkles className="w-4 h-4 text-blue-400" />;
        }
      };

      if (!currentUser || isLoading) {
        return (
          <div className={`w-full max-w-sm space-y-4 ${className}`}>
            {/* Header Skeleton */}
            {showHeader && (
              <div className="flex items-center gap-2 px-2">
                <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-700/50 rounded w-32 animate-pulse"></div>
              </div>
            )}

            {/* Recommendation Sections Skeleton */}
            {[1, 2, 3].map((section) => (
              <GlassCard key={section} padding="p-4">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse"></div>
                  <div>
                    <div className="h-4 bg-gray-700/50 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-32 animate-pulse"></div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="space-y-3">
                  {[1, 2, 3].slice(0, maxItemsPerSection).map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30"
                    >
                      {/* Avatar Skeleton */}
                      <div className="w-10 h-10 bg-gray-700/50 rounded-full animate-pulse flex-shrink-0"></div>

                      {/* Content Skeleton */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="h-4 bg-gray-700/50 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-700/50 rounded w-full mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-700/50 rounded w-2/3 mb-2 animate-pulse"></div>

                            {/* Badge Skeleton */}
                            <div className="h-5 bg-gray-700/50 rounded-full w-16 animate-pulse"></div>
                          </div>
                          <div className="w-4 h-4 bg-gray-700/50 rounded animate-pulse flex-shrink-0 ml-2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}

            {/* Footer Skeleton */}
            <div className="px-2">
              <div className="h-8 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>
        );
      }

      if (error || !recommendations) {
        return (
          <div className={`w-full max-w-sm ${className}`}>
            <GlassCard padding="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-3">
                  {error || "Unable to load recommendations"}
                </p>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="text-xs bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
            </GlassCard>
          </div>
        );
      }

      const allSections = [
        recommendations.agents,
        recommendations.clients,
        recommendations.companies,
      ];
      const sectionsWithContent = allSections.filter(
        (section) => section.recommendations.length > 0
      );

      return (
        <div
          ref={sidebarRef}
          className={`w-full max-w-sm space-y-4 transition-all duration-300 ease-in-out ${className} ${
            isSticky ? "sticky top-20 z-10" : ""
          }`}
          style={{
            transform: isSticky ? "translateY(0)" : "none",
          }}
        >
          {/* Header */}
          {showHeader && (
            <div className="flex items-center gap-2 px-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-gray-200 text-sm">
                Recommended for you
              </h2>
            </div>
          )}

          {/* Recommendation Sections */}
          {sectionsWithContent.map((section, sectionIndex) => (
            <GlassCard key={sectionIndex} padding="p-4">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getSectionIcon(section.title)}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">
                      {section.title}
                    </h3>
                    <p className="text-xs text-gray-400">{section.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="space-y-3">
                {section.recommendations
                  .slice(0, maxItemsPerSection)
                  .map((recommendation) => (
                    <div
                      key={recommendation.id}
                      className="group flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/40 cursor-pointer transition-all duration-200 border border-gray-700/30 hover:border-gray-600/50"
                      onClick={() => handleRecommendationClick(recommendation)}
                    >
                      {/* Avatar or Icon */}
                      <div className="flex-shrink-0">
                        {recommendation.metadata?.profilePicture ? (
                          <Avatar className="w-10 h-10 ring-2 ring-gray-600/50">
                            <AvatarImage
                              src={recommendation.metadata.profilePicture}
                            />
                            <AvatarFallback className="bg-gray-700 text-gray-300">
                              {getTypeIcon(recommendation.type)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(recommendation.type)} ring-2 ring-gray-600/30`}
                          >
                            {getTypeIcon(recommendation.type)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-gray-200 truncate group-hover:text-white transition-colors">
                              {recommendation.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2 group-hover:text-gray-300 transition-colors">
                              {recommendation.description}
                            </p>

                            {/* Match Score */}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="secondary"
                                className="text-xs px-2 py-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30"
                              >
                                {recommendation.matchScore}% match
                              </Badge>
                              {recommendation.metadata?.location && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">
                                    {recommendation.metadata.location}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-400 flex-shrink-0 ml-2 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </GlassCard>
          ))}

          {/* Footer */}
          <div className="px-2">
            <Button
              variant="ghost"
              onClick={handleRefresh}
              className="w-full text-xs text-gray-500 hover:text-gray-400 hover:bg-gray-800/30 p-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh recommendations
            </Button>
          </div>
        </div>
      );
    }
  );

RecommendationSidebar.displayName = "RecommendationSidebar";
