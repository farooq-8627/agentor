import { useState, useCallback, useEffect, useMemo } from "react";
import { Post, PostFilter, Comment, Author } from "@/types/post";
import { addComment, deleteComment, editComment } from "@/lib/actions/comments";
import { usePost } from "@/lib/context/PostContext";
import { client } from "@/sanity/lib/client";
import { postQueries } from "@/lib/queries/post";
import { showError } from "@/lib/utils/errorHandler";

interface UsePostsOptions {
  search?: string;
  sort?: { field: string; order: "asc" | "desc" };
  authorTypes?: ("agent" | "client")[];
}

export function usePosts(options: UsePostsOptions = {}) {
  // console.log("🔄 usePosts hook called:", {
  //   search: options.search,
  //   sort: options.sort,
  //   authorTypes: options.authorTypes,
  //   timestamp: new Date().toISOString()
  // });

  const { search = "", sort, authorTypes = [] } = options;
  const {
    posts,
    userPosts,
    achievementPosts,
    latestPosts,
    popularPosts,
    loading,
    error,
    fetchPosts: originalFetchPosts,
    fetchUserPosts,
    fetchAchievementPosts,
    fetchLatestPosts: originalFetchLatestPosts,
    fetchPopularPosts: originalFetchPopularPosts,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    setPosts,
    setLatestPosts,
    setPopularPosts,
  } = usePost();

  // State for filtered posts
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Auto-fetch posts when hook is first used - ONLY on mount
  useEffect(() => {
    const initialFetch = async () => {
      try {
        await originalFetchPosts();
        await originalFetchLatestPosts();
        await originalFetchPopularPosts();
      } catch (error) {
        showError(error, "Error in initial fetch");
      }
    };

    // Only fetch on mount if no data exists
    if (
      posts.length === 0 &&
      latestPosts.length === 0 &&
      popularPosts.length === 0 &&
      !loading
    ) {
      initialFetch();
    }
  }, []); // Empty dependency array - mount only

  const manualRefresh = useCallback(async () => {
    try {
      await originalFetchPosts();
      await originalFetchLatestPosts();
      await originalFetchPopularPosts();
    } catch (error) {
      showError(error, "Error in manual refresh");
    }
  }, [originalFetchPosts, originalFetchLatestPosts, originalFetchPopularPosts]);

  // Memoized filtered query to prevent unnecessary re-builds
  const filteredQuery = useMemo(() => {
    if (!search && (!authorTypes || authorTypes.length === 0)) {
      return null;
    }

    let baseQuery = '*[_type == "post"';

    // Add search conditions
    const conditions = [];
    if (search) {
      conditions.push(`(
        title match "*${search}*" ||
        content match "*${search}*" ||
        tags[]->title match "*${search}*"
      )`);
    }

    // Add author type filters
    if (authorTypes && authorTypes.length > 0) {
      const authorTypeConditions = authorTypes.map(
        (type) => `author->authorType == "${type}"`
      );
      conditions.push(`(${authorTypeConditions.join(" || ")})`);
    }

    if (conditions.length > 0) {
      baseQuery += ` && ${conditions.join(" && ")}`;
    }

    baseQuery += `] | order(_createdAt desc) {
      ...,
      "author": coalesce(
        author->{
          _id,
          personalDetails {
            username,
            profilePicture {
              asset-> {
                url
              }
            }
          },
          coreIdentity {
            fullName,
            tagline,
            bio
          }
        },
        author->userId->{
          _id,
          personalDetails {
            username,
            profilePicture {
              asset-> {
                url
              }
            }
          },
          coreIdentity {
            fullName,
            tagline,
            bio
          }
        }
      ),
      media[] {
        type,
        caption,
        altText,
        "file": {
          "asset": {
            "url": file.asset->url
          }
        }
      }
    }`;

    return baseQuery;
  }, [search, sort, authorTypes]);

  // Fetch filtered posts when query changes - MOVED BACK TO useEffect
  useEffect(() => {
    if (!filteredQuery) {
      setFilteredPosts([]);
      setIsFiltering(false);
      return;
    }

    const fetchFilteredPosts = async () => {
      try {
        setIsFiltering(true);
        const result = await client.fetch(filteredQuery);
        setFilteredPosts(result || []);
      } catch (error) {
        showError(error, "Error fetching filtered posts");
        setFilteredPosts([]);
      } finally {
        setIsFiltering(false);
      }
    };

    fetchFilteredPosts();
  }, [filteredQuery]);

  // Determine if we should show filtered posts or regular posts
  const shouldShowFiltered = search || authorTypes.length > 0;

  // Filtered fetch functions that return the appropriate data
  const fetchPosts = useCallback(async () => {
    if (shouldShowFiltered) {
      // If filtering, the useEffect above handles the fetch
      return;
    }
    return originalFetchPosts();
  }, [shouldShowFiltered, originalFetchPosts]);

  const fetchLatestPosts = useCallback(async () => {
    if (shouldShowFiltered) {
      // If filtering, the useEffect above handles the fetch
      return;
    }
    return originalFetchLatestPosts();
  }, [shouldShowFiltered, originalFetchLatestPosts]);

  const fetchPopularPosts = useCallback(async () => {
    if (shouldShowFiltered) {
      // If filtering, the useEffect above handles the fetch
      return;
    }
    return originalFetchPopularPosts();
  }, [shouldShowFiltered, originalFetchPopularPosts]);

  // Comment handlers
  const handleAddComment = useCallback(
    async (
      postId: string,
      text: string,
      author: any,
      parentCommentKey?: string
    ) => {
      try {
        return await addComment(postId, text, author, parentCommentKey);
      } catch (error) {
        showError(error, "Error adding comment");
        return {
          success: false,
          error: "Failed to add comment",
        };
      }
    },
    [addComment]
  );

  const handleDeleteComment = useCallback(
    async (
      postId: string,
      commentKey: string,
      isReply?: boolean,
      parentCommentKey?: string
    ) => {
      try {
        return await deleteComment(
          postId,
          commentKey,
          isReply,
          parentCommentKey
        );
      } catch (error) {
        showError(error, "Error deleting comment");
        return {
          success: false,
          error: "Failed to delete comment",
        };
      }
    },
    [deleteComment]
  );

  const handleEditComment = useCallback(
    async (
      postId: string,
      commentKey: string,
      text: string,
      isReply?: boolean,
      parentCommentKey?: string
    ) => {
      try {
        return await editComment(
          postId,
          commentKey,
          text,
          isReply,
          parentCommentKey
        );
      } catch (error) {
        showError(error, "Error updating comment");
        return {
          success: false,
          error: "Failed to update comment",
        };
      }
    },
    [editComment]
  );

  return {
    posts: shouldShowFiltered ? filteredPosts : posts,
    latestPosts: shouldShowFiltered ? filteredPosts : latestPosts,
    popularPosts: shouldShowFiltered ? filteredPosts : popularPosts,
    userPosts,
    achievementPosts,
    loading: loading || isFiltering,
    error,
    fetchPosts,
    fetchUserPosts,
    fetchAchievementPosts,
    fetchLatestPosts,
    fetchPopularPosts,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    handleAddComment,
    handleDeleteComment,
    handleEditComment,
    manualRefresh,
  };
}
