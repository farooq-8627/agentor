"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Post, PostFilter, Like } from "@/types/post";
import { postQueries } from "../queries/post";
import { client } from "@/sanity/lib/client";
import { likePost as likePostAction } from "@/lib/actions/post";

interface PostContextType {
  posts: Post[];
  userPosts: Post[];
  achievementPosts: Post[];
  latestPosts: Post[];
  popularPosts: Post[];
  loading: boolean;
  error: string | null;
  // State setters
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setUserPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setAchievementPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setLatestPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setPopularPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  // Post Operations
  fetchPosts: (filter?: PostFilter) => Promise<void>;
  fetchUserPosts: (username: string) => Promise<void>;
  fetchAchievementPosts: (username: string) => Promise<void>;
  fetchLatestPosts: () => Promise<void>;
  fetchPopularPosts: () => Promise<void>;
  createPost: (postData: Partial<Post>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, text: string, author: any) => Promise<any>;
  deleteComment: (postId: string, commentKey: string) => Promise<any>;
  updateComment: (
    postId: string,
    commentKey: string,
    text: string
  ) => Promise<any>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function usePost() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
}

export function PostProvider({ children }: { children: React.ReactNode }) {
  // console.log("🔄 PostProvider render");

  const [posts, setPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [achievementPosts, setAchievementPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track if data has been loaded

  // Log state changes
  useEffect(() => {
    // console.log("📊 PostContext state changed:", {
    //   postsLength: posts.length,
    //   userPostsLength: userPosts.length,
    //   achievementPostsLength: achievementPosts.length,
    //   latestPostsLength: latestPosts.length,
    //   popularPostsLength: popularPosts.length,
    //   loading,
    //   error: !!error,
    //   isInitialized
    // });
  }, [
    posts,
    userPosts,
    achievementPosts,
    latestPosts,
    popularPosts,
    loading,
    error,
    isInitialized,
  ]);

  // Only fetch posts on first mount or manual refresh, not on updates
  const fetchPosts = useCallback(
    async (filter?: PostFilter) => {
      if (loading) return; // Prevent concurrent fetches

      try {
        setLoading(true);
        setError(null);
        const result = await client.fetch(postQueries.getAllPosts(filter));
        setPosts(result);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Fetch user posts (for dashboards - should refresh immediately)
  const fetchUserPosts = useCallback(
    async (username: string) => {
      if (loading) return;

      try {
        setLoading(true);
        setError(null);
        const result = await client.fetch(postQueries.getUserPosts(username));
        setUserPosts(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user posts"
        );
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const fetchAchievementPosts = useCallback(
    async (username: string) => {
      if (loading) return;

      try {
        setLoading(true);
        setError(null);
        const result = await client.fetch(
          postQueries.getUserAchievements(username)
        );
        setAchievementPosts(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch achievement posts"
        );
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const fetchLatestPosts = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      const result = await client.fetch(postQueries.getLatestPosts());
      setLatestPosts(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch latest posts"
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchPopularPosts = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      const result = await client.fetch(postQueries.getPopularPosts());
      setPopularPosts(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch popular posts"
      );
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const createPost = useCallback(
    async (postData: Partial<Post>) => {
      try {
        setLoading(true);
        setError(null);
        await client.create({
          _type: "post",
          ...postData,
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
        });
        // Refresh posts after creation
        await fetchPosts();
      } catch (err) {
        setError("Failed to create post");
        console.error("Error creating post:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchPosts]
  );

  const deletePost = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      await client.delete(postId);
      // Update posts state by removing the deleted post
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      setError("Failed to delete post");
      console.error("Error deleting post:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to update post likes in all post lists
  const updatePostLikesInState = useCallback(
    (postId: string, updatedLikes: Like[]) => {
      const updatePostsState = (posts: Post[]): Post[] =>
        posts.map((post) =>
          post._id === postId ? { ...post, likes: updatedLikes } : post
        );

      setPosts(updatePostsState);
      setUserPosts(updatePostsState);
      setAchievementPosts(updatePostsState);
      setLatestPosts(updatePostsState);
      setPopularPosts(updatePostsState);
    },
    []
  );

  const likePost = useCallback(
    async (postId: string, userId: string) => {
      try {
        // console.log("=== Starting client-side like operation ===");

        // Make the backend call
        const result = await likePostAction(postId, userId);
        // console.log("Server action result:", result);

        if (!result.success) {
          throw new Error(result.error || "Failed to like/unlike post");
        }

        // Don't fetch updated post - the optimistic update in PostCard is sufficient
        // This prevents unnecessary re-renders and data fetching
        // The backend has been updated, local state is already correct from optimistic update
      } catch (err) {
        console.error("Error in likePost:", err);
        setError(
          err instanceof Error ? err.message : "Failed to like/unlike post"
        );
      }
    },
    [] // No dependencies needed since we're not fetching data
  );

  const unlikePost = useCallback(
    async (postId: string, userId: string) => {
      // We can just use likePost since it handles both liking and unliking
      await likePost(postId, userId);
    },
    [likePost]
  );

  const addComment = useCallback(
    async (postId: string, text: string, author: any) => {
      console.log("📝 PostContext addComment called:", {
        postId,
        text: text.substring(0, 50) + "...",
        authorId: author._id,
      });

      try {
        setLoading(true);
        setError(null);
        const result = await client.create({
          _type: "comment",
          post: { _type: "reference", _ref: postId },
          text: text,
          author: { _type: "reference", _ref: author._id },
          createdAt: new Date().toISOString(),
        });

        console.log("✅ Comment created successfully, NOT refetching posts");
        // Don't refresh posts - let individual components handle their own updates
        // await fetchPosts(); // This was causing the re-renders!

        return result;
      } catch (err) {
        setError("Failed to add comment");
        console.error("Error adding comment:", err);
        return { success: false, error: "Failed to add comment" };
      } finally {
        setLoading(false);
      }
    },
    [] // No dependencies needed
  );

  const deleteComment = useCallback(
    async (postId: string, commentKey: string) => {
      console.log("🗑️ PostContext deleteComment called:", {
        postId,
        commentKey,
      });

      try {
        setLoading(true);
        setError(null);
        const result = await client.delete(commentKey);

        console.log("✅ Comment deleted successfully, NOT refetching posts");
        // Don't refresh posts - let individual components handle their own updates
        // await fetchPosts(); // This was causing the re-renders!

        return result;
      } catch (err) {
        setError("Failed to delete comment");
        console.error("Error deleting comment:", err);
        return { success: false, error: "Failed to delete comment" };
      } finally {
        setLoading(false);
      }
    },
    [] // No dependencies needed
  );

  const updateComment = useCallback(
    async (postId: string, commentKey: string, text: string) => {
      console.log("✏️ PostContext updateComment called:", {
        postId,
        commentKey,
        text: text.substring(0, 50) + "...",
      });

      try {
        setLoading(true);
        setError(null);
        const result = await client
          .patch(postId)
          .setIfMissing({ comments: [] })
          .insert("after", "comments[-1]", [
            {
              _key: commentKey,
              _type: "comment",
              text: text,
            },
          ])
          .commit();

        console.log("✅ Comment updated successfully, NOT refetching posts");
        // Don't refresh posts - let individual components handle their own updates
        // await fetchPosts(); // This was causing the re-renders!

        return result;
      } catch (err) {
        setError("Failed to update comment");
        console.error("Error updating comment:", err);
        return { success: false, error: "Failed to update comment" };
      } finally {
        setLoading(false);
      }
    },
    [] // No dependencies needed
  );

  const value = {
    posts,
    userPosts,
    achievementPosts,
    latestPosts,
    popularPosts,
    loading,
    error,
    setPosts,
    setUserPosts,
    setAchievementPosts,
    setLatestPosts,
    setPopularPosts,
    fetchPosts,
    fetchUserPosts,
    fetchAchievementPosts,
    fetchLatestPosts,
    fetchPopularPosts,
    createPost,
    deletePost,
    likePost,
    unlikePost,
    addComment,
    deleteComment,
    updateComment,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}
