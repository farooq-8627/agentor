"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  TrendingUp,
  Clock,
  Users,
  UserCheck,
  Building,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface InfiniteFeedPageLayoutProps {
  title: string;
  subtitle: string;
  data: any[];
  loading: boolean;
  error: Error | null;
  renderCard: (item: any) => React.ReactNode;
  emptyStateMessage?: string;
  onSearchAndFiltersChange?: (
    searchQuery: string,
    authorTypes: ("agent" | "client")[],
    sort?: { field: string; order: "asc" | "desc" },
    achievementFilter?: boolean
  ) => void;
  onSortChange?: (sort: { field: string; order: "asc" | "desc" }) => void;
  onAchievementToggle?: () => void;
  currentSort?: { field: string; order: "asc" | "desc" };
  currentAuthorTypes?: ("agent" | "client")[];
  isAchievementFilter?: boolean;
  initialBatchSize?: number;
  batchSize?: number;
}

export function InfiniteFeedPageLayout({
  title,
  subtitle,
  data,
  loading,
  error,
  renderCard,
  emptyStateMessage = "No posts found",
  onSearchAndFiltersChange,
  onSortChange,
  onAchievementToggle,
  currentSort,
  currentAuthorTypes = [],
  isAchievementFilter = false,
  initialBatchSize = 5,
  batchSize = 5,
}: InfiniteFeedPageLayoutProps) {
  // console.log("🔄 InfiniteFeedPageLayout render:", {
  //   dataLength: data?.length || 0,
  //   loading,
  //   error: !!error,
  //   timestamp: new Date().toISOString()
  // });

  const [searchInput, setSearchInput] = useState("");
  const hasInitializedRef = useRef(false);

  const {
    visibleItems,
    hasMore,
    isLoading: isLoadingMore,
    loadMore,
    reset,
    observerRef,
  } = useInfiniteScroll({
    initialBatchSize,
    batchSize,
    threshold: 2,
  });

  // Reset infinite scroll ONLY on first mount with data
  useEffect(() => {
    // console.log("🔄 InfiniteFeedPageLayout useEffect triggered:", {
    //   hasData: !!(data && data.length > 0),
    //   dataLength: data?.length || 0,
    //   hasInitialized: hasInitializedRef.current,
    //   willReset: !!(data && data.length > 0 && !hasInitializedRef.current),
    // });

    if (data && data.length > 0 && !hasInitializedRef.current) {
      // console.log("🔄 Resetting infinite scroll - first mount");
      reset(data || []);
      hasInitializedRef.current = true;
    }
  }, [data, reset]);

  // Manual refresh function that components can call
  const handleManualRefresh = useCallback(() => {
    hasInitializedRef.current = false; // Allow re-initialization
    reset(data || []);
    hasInitializedRef.current = true;
  }, [data, reset]);

  const handleSearch = () => {
    if (onSearchAndFiltersChange) {
      onSearchAndFiltersChange(searchInput, currentAuthorTypes, currentSort);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSortClick = (field: string, order: "asc" | "desc") => {
    const newSort = { field, order };
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  const handleAuthorTypeToggle = (type: "agent" | "client") => {
    const newAuthorTypes = currentAuthorTypes.includes(type)
      ? currentAuthorTypes.filter((t) => t !== type)
      : [...currentAuthorTypes, type];

    if (onSearchAndFiltersChange) {
      onSearchAndFiltersChange(searchInput, newAuthorTypes, currentSort);
    }
  };

  const handleAchievementClick = () => {
    if (onAchievementToggle) {
      onAchievementToggle();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-red-400">Error loading posts: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Search and Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          {/* Search Bar */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent backdrop-blur-sm"
              />
              <Button
                variant="ghost"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-violet-500 hover:bg-violet-500/10"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* All Filter and Sort Buttons in Single Row */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {/* Sort Buttons */}
              <Button
                variant={
                  currentSort?.field === "createdAt" &&
                  currentSort?.order === "desc" &&
                  !isAchievementFilter
                    ? "default"
                    : "outline"
                }
                onClick={() => handleSortClick("createdAt", "desc")}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm backdrop-blur-sm transition-all duration-200 whitespace-nowrap ${
                  currentSort?.field === "createdAt" &&
                  currentSort?.order === "desc" &&
                  !isAchievementFilter
                    ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-violet-500/20 hover:border-violet-500/40"
                }`}
              >
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                Latest
              </Button>
              <Button
                variant={
                  currentSort?.field === "likes" &&
                  currentSort?.order === "desc" &&
                  !isAchievementFilter
                    ? "default"
                    : "outline"
                }
                onClick={() => handleSortClick("likes", "desc")}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm backdrop-blur-sm transition-all duration-200 whitespace-nowrap ${
                  currentSort?.field === "likes" &&
                  currentSort?.order === "desc" &&
                  !isAchievementFilter
                    ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-violet-500/20 hover:border-violet-500/40"
                }`}
              >
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                Popular
              </Button>
              <Button
                variant={
                  currentSort?.field === "comments" &&
                  currentSort?.order === "desc" &&
                  !isAchievementFilter
                    ? "default"
                    : "outline"
                }
                onClick={() => handleSortClick("comments", "desc")}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm backdrop-blur-sm transition-all duration-200 whitespace-nowrap ${
                  currentSort?.field === "comments" &&
                  currentSort?.order === "desc" &&
                  !isAchievementFilter
                    ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-violet-500/20 hover:border-violet-500/40"
                }`}
              >
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Most Discussed</span>
                <span className="sm:hidden">Discussed</span>
              </Button>
              <Button
                variant={isAchievementFilter ? "default" : "outline"}
                onClick={handleAchievementClick}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm backdrop-blur-sm transition-all duration-200 whitespace-nowrap ${
                  isAchievementFilter
                    ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-violet-500/20 hover:border-violet-500/40"
                }`}
              >
                🏆 <span className="hidden sm:inline">Achievements</span>
                <span className="sm:hidden">Awards</span>
              </Button>

              {/* Author Type Filter Buttons */}
              <Button
                variant={
                  currentAuthorTypes.includes("agent") ? "default" : "outline"
                }
                onClick={() => handleAuthorTypeToggle("agent")}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm backdrop-blur-sm transition-all duration-200 whitespace-nowrap ${
                  currentAuthorTypes.includes("agent")
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-blue-500/20 hover:border-blue-500/40"
                }`}
              >
                <UserCheck className="h-3 w-3 md:h-4 md:w-4" />
                Agents
              </Button>
              <Button
                variant={
                  currentAuthorTypes.includes("client") ? "default" : "outline"
                }
                onClick={() => handleAuthorTypeToggle("client")}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm backdrop-blur-sm transition-all duration-200 whitespace-nowrap ${
                  currentAuthorTypes.includes("client")
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-500"
                    : "bg-white/5 border-white/10 text-white hover:bg-green-500/20 hover:border-green-500/40"
                }`}
              >
                <Building className="h-3 w-3 md:h-4 md:w-4" />
                Clients
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-gray-400 text-sm">
            Showing {visibleItems?.length || 0} of {data?.length || 0} posts
            {currentAuthorTypes.length > 0 && (
              <span className="ml-2">
                • Filtered by: {currentAuthorTypes.join(", ")}
              </span>
            )}
          </p>
        </motion.div>

        {/* Posts List */}
        {visibleItems && visibleItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6 mb-12"
          >
            {visibleItems.map((item: any, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                {renderCard(item)}
              </motion.div>
            ))}

            {/* Intersection Observer Target with Load More Button */}
            {hasMore && (
              <div
                ref={observerRef}
                className="h-20 flex items-center justify-center"
              >
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Posts
                      <TrendingUp className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {emptyStateMessage}
            </h3>
            <p className="text-gray-400">
              {searchInput || currentAuthorTypes.length > 0
                ? `No results found for your search or filters. Try adjusting your criteria.`
                : "Check back later for new posts."}
            </p>
          </motion.div>
        )}

        {/* Loading Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-violet-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more posts...</span>
            </div>
          </div>
        )}

        {/* End of Feed Indicator */}
        {!hasMore &&
          visibleItems.length > 0 &&
          visibleItems.length === data.length &&
          data.length > initialBatchSize && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                <UserCheck className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400">
                You've reached the end of the feed!
              </p>
            </motion.div>
          )}
      </div>
    </div>
  );
}
