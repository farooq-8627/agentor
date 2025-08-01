"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { postQueries } from "@/lib/queries/post";
import { revalidatePath } from "next/cache";

export async function likePost(postId: string, userId: string) {
  if (!process.env.SANITY_API_TOKEN) {
    return { success: false, error: "Server configuration error" };
  }

  try {
    // Get user details first - handle both prefixed and unprefixed IDs
    const sanitizedUserId = userId.startsWith("user-")
      ? userId
      : `user-${userId}`;
    const userDetails = await backendClient.fetch(
      `*[_type == "user" && _id == $userId][0]{
        personalDetails {
          username,
          profilePicture {
            asset-> {
              url
            }
          }
        }
      }`,
      { userId: sanitizedUserId }
    );

    if (!userDetails) {
      return { success: false, error: "User not found" };
    }

    // First check if the user has already liked the post
    const existingLikes = await backendClient.fetch(
      postQueries.getPostLikes(postId)
    );

    const hasLiked = existingLikes?.likes?.some(
      (like: any) =>
        like.personalDetails?.username === userDetails.personalDetails.username
    );

    if (hasLiked) {
      // Remove like by finding the like with matching username
      const likesToKeep = existingLikes.likes.filter(
        (like: any) =>
          like.personalDetails?.username !==
          userDetails.personalDetails.username
      );

      await backendClient.patch(postId).set({ likes: likesToKeep }).commit();

      // Don't revalidate paths - client handles optimistic updates
      // revalidatePath("/feed");
      // revalidatePath("/dashboard/[username]/posts", "page");
      // revalidatePath("/dashboard/[username]", "layout");
      return { success: true, action: "unlike" };
    } else {
      // Add like with proper user details
      const likeData = {
        _type: "like",
        _key: `${userId}-${Date.now()}`,
        likedAt: new Date().toISOString(),
        personalDetails: {
          username: userDetails.personalDetails.username,
          profilePicture:
            userDetails.personalDetails.profilePicture?.asset?.url || null,
        },
      };

      // Add the new like
      await backendClient
        .patch(postId)
        .setIfMissing({ likes: [] })
        .append("likes", [likeData])
        .commit();

      // Don't revalidate paths - client handles optimistic updates
      // revalidatePath("/feed");
      // revalidatePath("/dashboard/[username]/posts", "page");
      // revalidatePath("/dashboard/[username]", "layout");
      return { success: true, action: "like" };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to like/unlike post",
    };
  }
}

export async function unlikePost(postId: string, userId: string) {
  try {
    await backendClient
      .patch(postId)
      .unset([`likes[_ref=="${userId}"]`])
      .commit();
    return { success: true, action: "unliked" };
  } catch (error) {
    console.error("Error handling unlike:", error);
    return { success: false, error };
  }
}

export async function getLikes(postId: string) {
  try {
    const result = await backendClient.fetch(postQueries.getPostLikes(postId));
    return { success: true, data: result?.likes || [] };
  } catch (error) {
    console.error("Error fetching likes:", error);
    return { success: false, error };
  }
}
