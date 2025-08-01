"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/UI/GlassCard";
import { Button } from "@/components/UI/button";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Send,
  ExternalLink,
  MoreHorizontal,
  FileText,
  Video,
  File,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Heart as HeartFilled } from "@phosphor-icons/react";
import { PostModal } from "@/components/cards/Feed/PostModal";
import { formatPostTime } from "@/lib/formatPostTime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/UI/avatar";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types/post";
import { useUser } from "@clerk/nextjs";
import { Like } from "@/types/post";
import { OptimizedVideo } from "@/components/shared/OptimizedVideo";
import { likePost as likePostAction } from "@/lib/actions/post";

export interface Media {
  type: "image" | "video" | "pdf";
  file: {
    asset: {
      url: string;
    };
  };
  caption?: string;
  altText?: string;
  aspectRatio?: number;
}

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
    likes: Like[];
    comments: number;
    media?: Media[];
    author: {
      _id: string;
      name: string;
      username: string;
      profilePicture: {
        asset: {
          url: string;
        };
      };
      tagline?: string;
      verified?: boolean;
      roles?: string[];
    };
  };
  className?: string;
}

export function PostCard({ post: initialPost, className }: PostCardProps) {
  // console.log("🔄 PostCard render:", {
  //   postId: initialPost._id,
  //   title: initialPost.title?.substring(0, 30) + "...",
  //   timestamp: new Date().toISOString(),
  // });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<Media[]>(
    initialPost.media || []
  );
  const [post, setPost] = useState(initialPost);
  const { user } = useUser();
  // Remove PostContext dependency - handle likes independently
  // const { likePost } = usePost();

  // Track post prop changes
  useEffect(() => {
    // console.log("📝 PostCard: post prop changed:", {
    //   postId: initialPost._id,
    //   from: post._id,
    //   to: initialPost._id,
    //   likesChanged: post.likes.length !== initialPost.likes.length,
    // });

    // Only update if the post ID actually changed (different post)
    if (initialPost._id !== post._id) {
      setPost(initialPost);
    }
  }, [initialPost._id, post._id]); // Only depend on IDs, not the full objects

  // Add memoized isLiked check
  const isLiked = useMemo(() => {
    if (!user?.username || !post.likes) return false;
    // Ensure post.likes is an array before calling .some()
    if (!Array.isArray(post.likes)) return false;
    return post.likes.some(
      (like) => like.personalDetails?.username === user.username
    );
  }, [user?.username, post.likes]);

  // Calculate aspect ratio for images
  const calculateAspectRatio = (url: string): Promise<number> => {
    return new Promise<number>((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        resolve(img.width / img.height);
      };
      img.onerror = () => {
        resolve(1.33); // Default to 4:3 aspect ratio on error
      };
      img.src = url;
    });
  };

  // Sort media by priority: video > image > pdf
  const sortMediaByPriority = (media: Media[]): Media[] => {
    const priorityOrder = { video: 1, image: 2, pdf: 3 };
    return [...media].sort((a, b) => {
      return priorityOrder[a.type] - priorityOrder[b.type];
    });
  };

  // Update media with aspect ratios and sort by priority
  useEffect(() => {
    const media = post.media || [];
    if (media.length === 0) return;

    const updateAspectRatios = async () => {
      const sortedMedia = sortMediaByPriority(media);
      const updatedMedia = await Promise.all(
        sortedMedia.map(async (media) => {
          if (media.type === "image") {
            const aspectRatio = await calculateAspectRatio(
              media.file.asset.url
            );
            return { ...media, aspectRatio };
          }
          return media;
        })
      );

      setMediaItems(updatedMedia);
    };

    updateAspectRatios();
  }, [post.media]);

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setIsModalOpen(true);
  };

  const formattedTime = formatPostTime(post.createdAt);

  // Handle content expansion
  const shouldTruncate = post.content.length > 180;
  const displayContent = isExpanded ? post.content : post.content.slice(0, 180);
  const showTags = !shouldTruncate || isExpanded;

  // Enhanced media layout with video priority and show at least 3 items
  const getMediaLayout = (count: number, media: Media[], index: number) => {
    // Check if current media is video
    const isVideo = media[index]?.type === "video";
    const hasVideo = media.some((m) => m.type === "video");
    const firstIsVideo = media[0]?.type === "video"; // After sorting, video will be first if present

    // Video-optimized heights
    const videoHeight = "h-[400px]"; // Height for videos
    const baseHeight = "h-[280px]"; // Regular height for images
    const halfHeight = "h-[200px]"; // Height for second row

    // For 1-3 items, show all directly
    if (count <= 3) {
      switch (count) {
        case 1:
          return {
            gridClass: "grid-cols-1",
            containerClass: isVideo ? videoHeight : baseHeight,
            showViewMore: false,
            rowPosition: "single",
          };
        case 2:
          // Since media is sorted, if there's a video it will be first
          if (firstIsVideo) {
            return {
              gridClass: "grid-cols-1", // Stack vertically for video priority
              containerClass: isVideo ? videoHeight : baseHeight,
              showViewMore: false,
              rowPosition: index === 0 ? "first-row" : "second-row",
            };
          }
          // For non-video items, side by side
          return {
            gridClass: "grid-cols-2",
            containerClass: baseHeight,
            showViewMore: false,
            rowPosition: "first-row",
          };
        case 3:
          if (firstIsVideo) {
            // Video full width in first row, 2 items in second row
            if (index === 0) {
              return {
                gridClass: "grid-cols-1",
                containerClass: videoHeight,
                showViewMore: false,
                rowPosition: "first-row",
              };
            } else {
              return {
                gridClass: "grid-cols-2",
                containerClass: halfHeight,
                showViewMore: false,
                rowPosition: "second-row",
              };
            }
          } else {
            // No video, prioritize first item (image over pdf)
            if (index === 0) {
              return {
                gridClass: "grid-cols-1",
                containerClass: baseHeight,
                showViewMore: false,
                rowPosition: "first-row",
              };
            } else {
              return {
                gridClass: "grid-cols-2",
                containerClass: halfHeight,
                showViewMore: false,
                rowPosition: "second-row",
              };
            }
          }
      }
    }

    // For 4+ items, show first 3 and add view more
    if (firstIsVideo) {
      // Video full width + 2 items in second row (second item has overlay)
      if (index === 0) {
        return {
          gridClass: "grid-cols-1",
          containerClass: videoHeight,
          showViewMore: false,
          rowPosition: "first-row",
        };
      } else if (index === 1) {
        return {
          gridClass: "grid-cols-2",
          containerClass: halfHeight,
          showViewMore: false,
          rowPosition: "second-row",
        };
      } else if (index === 2) {
        return {
          gridClass: "grid-cols-2",
          containerClass: halfHeight,
          showViewMore: true,
          remainingCount: count - 3,
          rowPosition: "second-row",
        };
      } else {
        return {
          gridClass: "hidden",
          containerClass: "",
          showViewMore: false,
          rowPosition: "hidden",
        };
      }
    } else {
      // No video - first item large, second row with 2 items (second item has overlay)
      if (index === 0) {
        return {
          gridClass: "grid-cols-1",
          containerClass: baseHeight,
          showViewMore: false,
          rowPosition: "first-row",
        };
      } else if (index === 1) {
        return {
          gridClass: "grid-cols-2",
          containerClass: halfHeight,
          showViewMore: false,
          rowPosition: "second-row",
        };
      } else if (index === 2) {
        return {
          gridClass: "grid-cols-2",
          containerClass: halfHeight,
          showViewMore: true,
          remainingCount: count - 3,
          rowPosition: "second-row",
        };
      } else {
        return {
          gridClass: "hidden",
          containerClass: "",
          showViewMore: false,
          rowPosition: "hidden",
        };
      }
    }

    // Fallback
    return {
      gridClass: "grid-cols-1",
      containerClass: baseHeight,
      showViewMore: false,
      rowPosition: "first-row",
    };
  };

  // Render media item based on type with enhanced video handling
  const renderMediaItem = (
    media: Media,
    index: number,
    totalCount: number,
    originalIndex?: number
  ) => {
    const layout = getMediaLayout(totalCount, mediaItems, index);
    const containerClasses = `relative ${layout.containerClass} rounded-lg overflow-hidden`;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src = "/images/placeholder-media.jpg";
      e.currentTarget.onerror = null;
    };

    // Use original index for click handler if provided, otherwise use current index
    const clickIndex = originalIndex !== undefined ? originalIndex : index;

    const mediaContent = (() => {
      switch (media.type) {
        case "image":
          return (
            <div
              className={`${containerClasses} cursor-pointer group bg-gray-800`}
              onClick={() => handleMediaClick(clickIndex)}
            >
              <Image
                src={media.file.asset.url}
                alt={
                  media.altText || media.caption || `Media ${clickIndex + 1}`
                }
                fill
                className="object-cover transition-transform group-hover:scale-105"
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
              />
            </div>
          );
        case "video":
          return (
            <div className={`${containerClasses} bg-gray-900`}>
              {media.file.asset.url ? (
                <OptimizedVideo
                  src={media.file.asset.url}
                  className=""
                  onVideoClick={() => handleMediaClick(clickIndex)}
                  autoPlay={false} // No autoplay in feed
                  controls={true}
                  muted={true}
                  loop={true}
                  showControlsOnHover={true}
                  containerClassName="rounded-lg overflow-hidden"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Video className="w-12 h-12 text-gray-600" />
                  <span className="text-gray-400 text-sm mt-2">
                    Video unavailable
                  </span>
                </div>
              )}
            </div>
          );
        case "pdf":
          return (
            <div className={containerClasses}>
              <div
                className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center group hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleMediaClick(clickIndex)}
              >
                <FileText className="w-12 h-12 text-gray-400 group-hover:text-gray-300" />
                {media.caption && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm truncate">
                    {media.caption}
                  </span>
                )}
              </div>
            </div>
          );
        default:
          return (
            <div
              className={`${containerClasses} bg-gray-800 flex flex-col items-center justify-center`}
            >
              <File className="w-12 h-12 text-gray-600" />
              <span className="text-gray-400 text-sm mt-2">
                Unsupported media
              </span>
            </div>
          );
      }
    })();

    // Add view more overlay if needed
    if (
      layout.showViewMore &&
      layout.remainingCount &&
      layout.remainingCount > 0
    ) {
      return (
        <div className="relative">
          {mediaContent}
          <div
            className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
            onClick={() => handleMediaClick(clickIndex)}
          >
            <div className="text-center text-white">
              <span className="text-2xl font-semibold">
                +{layout.remainingCount}
              </span>
              <div className="text-sm mt-1">
                {layout.remainingCount === 1
                  ? "View 1 more"
                  : `View ${layout.remainingCount} more`}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return mediaContent;
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    window.location.href = `/dashboard/${post.author.username}`;
  };

  const handleLike = async () => {
    // console.log("❤️ Like operation started:", {
    //   postId: post._id,
    //   userId: user?.id,
    //   currentLikes: post.likes.length,
    //   isCurrentlyLiked: isLiked,
    // });

    if (!user?.id || !user?.username) return;

    // Create optimistic like object
    const optimisticLike: Like = {
      _id: user.id,
      _key: `${user.id}-${Date.now()}`,
      likedAt: new Date().toISOString(),
      personalDetails: {
        username: user.username,
        profilePicture: user.imageUrl
          ? {
              asset: {
                url: user.imageUrl,
              },
            }
          : undefined,
      },
    };

    // Optimistically update the UI
    const updatedLikes = isLiked
      ? post.likes.filter(
          (like) => like.personalDetails?.username !== user.username
        )
      : [...post.likes, optimisticLike];

    // Update local state immediately
    const updatedPost = {
      ...post,
      likes: updatedLikes,
    };

    // console.log("🎯 Optimistic update applied:", {
    //   postId: post._id,
    //   oldLikes: post.likes.length,
    //   newLikes: updatedLikes.length,
    //   action: isLiked ? "unlike" : "like",
    // });

    // Update the UI immediately
    setPost(updatedPost);

    try {
      // Make the backend call (this won't trigger data refetch anymore)
      // console.log("🌐 Making backend call...");
      await likePostAction(post._id, user.id);
      // console.log("✅ Backend call successful");
      // Success! Backend is updated, UI is already correct
    } catch (error) {
      // If there's an error, revert the optimistic update
      // console.error("❌ Error handling like:", error);
      // console.log("🔄 Reverting optimistic update");
      setPost(post); // Revert to original state
    }
  };

  return (
    <GlassCard className={cn("overflow-hidden", className)}>
      <div className="cursor-pointer">
        {/* Author Section */}
        <div className="flex items-start gap-3">
          <Avatar
            className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleAuthorClick}
          >
            <AvatarImage src={post.author.profilePicture.asset.url} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="font-semibold truncate cursor-pointer hover:text-violet-300 transition-colors"
                  onClick={handleAuthorClick}
                >
                  {post.author.name}
                </span>
                <ShieldCheck className="h-5 w-5 text-violet-400" />
              </div>
              {/* Move Author Type Badge to the right */}
              <div className="flex gap-1">
                {post.author.roles?.map((role) => (
                  <span
                    key={role}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-xs font-semibold",
                      role === "agent"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    )}
                  >
                    {role === "agent" ? "A" : "C"}
                  </span>
                ))}
              </div>
            </div>
            {/* Time */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Title Section */}
        {post.title && (
          <h2
            className="text-lg font-semibold mt-4 text-gray-100 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {post.title}
          </h2>
        )}

        {/* Content Section */}
        <div className="mt-3 cursor-pointer">
          <p className="whitespace-pre-wrap text-sm text-gray-200">
            {displayContent}
            {shouldTruncate && !isExpanded && "..."}
          </p>

          {/* Read More Button */}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-400 hover:text-blue-300 mt-2 font-medium"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}

          {/* Tags Section - Show only when text fits or is expanded */}
          {showTags && post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag, index) => (
                <span
                  key={`tag-${index}`}
                  className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-500/20 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Media Section with video priority and 2-row layout */}
        {mediaItems.length > 0 && (
          <div className="mt-4 rounded-xl overflow-hidden">
            {(() => {
              const firstIsVideo = mediaItems[0]?.type === "video";
              const hasVideo = mediaItems.some((m) => m.type === "video");

              // Create mapping from sorted media to original indices
              const originalMedia = post.media || [];
              const mediaWithOriginalIndices = mediaItems.map((sortedMedia) => {
                const originalIndex = originalMedia.findIndex(
                  (originalMedia) =>
                    originalMedia.file.asset.url ===
                      sortedMedia.file.asset.url &&
                    originalMedia.type === sortedMedia.type
                );
                return { media: sortedMedia, originalIndex };
              });

              // Group media items by rows based on layout logic
              const firstRowItems: {
                media: Media;
                index: number;
                originalIndex: number;
              }[] = [];
              const secondRowItems: {
                media: Media;
                index: number;
                originalIndex: number;
              }[] = [];

              mediaWithOriginalIndices.forEach(
                ({ media, originalIndex }, index) => {
                  const layout = getMediaLayout(
                    mediaItems.length,
                    mediaItems,
                    index
                  );
                  if (
                    layout.rowPosition === "first-row" ||
                    layout.rowPosition === "single"
                  ) {
                    firstRowItems.push({ media, index, originalIndex });
                  } else if (layout.rowPosition === "second-row") {
                    secondRowItems.push({ media, index, originalIndex });
                  }
                }
              );

              return (
                <div className="space-y-2">
                  {/* First Row */}
                  {firstRowItems.length > 0 && (
                    <div
                      className={`grid gap-2 ${
                        firstRowItems.length === 1
                          ? "grid-cols-1"
                          : firstRowItems.length === 2 && !hasVideo
                            ? "grid-cols-2"
                            : "grid-cols-1"
                      }`}
                    >
                      {firstRowItems.map(({ media, index, originalIndex }) => (
                        <div key={`first-${index}`}>
                          {renderMediaItem(
                            media,
                            index,
                            mediaItems.length,
                            originalIndex
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Second Row */}
                  {secondRowItems.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {secondRowItems.map(({ media, index, originalIndex }) => (
                        <div key={`second-${index}`}>
                          {renderMediaItem(
                            media,
                            index,
                            mediaItems.length,
                            originalIndex
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Engagement Section */}
        <div
          className="flex items-center gap-6 mt-4 text-sm text-gray-400 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center gap-1">
            <span>{post.likes.length}</span>
            <span>likes</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{post.comments}</span>
            <span>comments</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <Button
            className={cn(
              "flex items-center gap-2",
              isLiked ? "text-violet-400" : "text-gray-400 hover:text-white"
            )}
            onClick={handleLike}
            variant="ghost"
          >
            {isLiked ? (
              <HeartFilled weight="fill" className="h-5 w-5" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
            {isLiked ? "Liked" : "Like"}
          </Button>
          <Button
            className="flex items-center gap-2 text-gray-400 hover:text-white"
            onClick={() => setIsModalOpen(true)}
            variant="ghost"
          >
            <MessageCircle className="h-5 w-5" />
            Comment
          </Button>
          <Button
            className="flex items-center gap-2 text-gray-400 hover:text-white"
            variant="ghost"
          >
            <Send className="h-5 w-5" />
            Share
          </Button>
        </div>
      </div>

      {/* Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={post} // Use the current post state instead of the initial post
        selectedMediaIndex={selectedMediaIndex}
      />
    </GlassCard>
  );
}
