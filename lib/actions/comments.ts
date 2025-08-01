"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { Comment, Author } from "@/types/post";
import { revalidatePath } from "next/cache";

export interface CommentActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Add a new comment to a post
 */
export async function addComment(
  postId: string,
  text: string,
  author: Author,
  parentCommentKey?: string
): Promise<CommentActionResult> {
  try {
    // Create a reference to the user document
    const authorRef = {
      _type: "reference",
      _ref: author._id.startsWith("user-") ? author._id : `user-${author._id}`,
    };

    const newComment = {
      _key: new Date().toISOString(),
      content: text,
      author: authorRef,
      authorType: "agent",
      createdAt: new Date().toISOString(),
      isEdited: false,
      replies: [],
    };

    let patch;
    if (parentCommentKey) {
      // Add as a reply to existing comment
      patch = backendClient
        .patch(postId)
        .setIfMissing({
          [`comments[_key == "${parentCommentKey}"].replies`]: [],
        })
        .append(`comments[_key == "${parentCommentKey}"].replies`, [
          newComment,
        ]);
    } else {
      // Add as a top-level comment
      patch = backendClient
        .patch(postId)
        .setIfMissing({ comments: [] })
        .append("comments", [newComment]);
    }

    const result = await patch.commit({ autoGenerateArrayKeys: true });

    // Don't revalidate paths - client handles optimistic updates
    // revalidatePath("/feed");
    // revalidatePath("/dashboard/[username]", "layout");
    // revalidatePath("/dashboard/[username]/posts", "page");

    // Return the comment with expanded author data for immediate UI update
    const responseData = {
      _key: newComment._key,
      text: text,
      createdAt: newComment.createdAt,
      isEdited: false,
      replies: [],
      author: {
        _id: author._id,
        personalDetails: author.personalDetails,
        coreIdentity: author.coreIdentity,
      },
    };

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add comment",
    };
  }
}

/**
 * Edit an existing comment
 */
export async function editComment(
  postId: string,
  commentKey: string,
  text: string,
  isReply?: boolean,
  parentCommentKey?: string
): Promise<CommentActionResult> {
  try {
    let patch;
    if (isReply && parentCommentKey) {
      // Edit a reply
      patch = backendClient.patch(postId).set({
        [`comments[_key == "${parentCommentKey}"].replies[_key == "${commentKey}"].content`]:
          text,
        [`comments[_key == "${parentCommentKey}"].replies[_key == "${commentKey}"].isEdited`]: true,
        [`comments[_key == "${parentCommentKey}"].replies[_key == "${commentKey}"].updatedAt`]:
          new Date().toISOString(),
      });
    } else {
      // Edit a top-level comment
      patch = backendClient.patch(postId).set({
        [`comments[_key == "${commentKey}"].content`]: text,
        [`comments[_key == "${commentKey}"].isEdited`]: true,
        [`comments[_key == "${commentKey}"].updatedAt`]:
          new Date().toISOString(),
      });
    }

    const result = await patch.commit();

    // Don't revalidate paths - client handles optimistic updates
    // revalidatePath("/feed");
    // revalidatePath("/dashboard/[username]", "layout");
    // revalidatePath("/dashboard/[username]/posts", "page");

    return {
      success: true,
      data: {
        text,
        isEdited: true,
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit comment",
    };
  }
}

/**
 * Delete a comment or reply
 */
export async function deleteComment(
  postId: string,
  commentKey: string,
  isReply?: boolean,
  parentCommentKey?: string
): Promise<CommentActionResult> {
  try {
    let patch;
    if (isReply && parentCommentKey) {
      // Remove a reply from a comment
      patch = backendClient
        .patch(postId)
        .unset([
          `comments[_key == "${parentCommentKey}"].replies[_key == "${commentKey}"]`,
        ]);
    } else {
      // Remove a top-level comment
      patch = backendClient
        .patch(postId)
        .unset([`comments[_key == "${commentKey}"]`]);
    }

    const result = await patch.commit();

    // Don't revalidate paths - client handles optimistic updates
    // revalidatePath("/feed");
    // revalidatePath("/dashboard/[username]", "layout");
    // revalidatePath("/dashboard/[username]/posts", "page");
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

/**
 * Update an existing comment
 */
export async function updateComment(
  postId: string,
  commentKey: string,
  text: string
): Promise<CommentActionResult> {
  try {
    const result = await backendClient
      .patch(postId)
      .set({
        [`comments[_key == "${commentKey}"].content`]: text,
        [`comments[_key == "${commentKey}"].updatedAt`]:
          new Date().toISOString(),
      })
      .commit();

    // Don't revalidate paths - client handles optimistic updates
    // revalidatePath("/feed");
    // revalidatePath("/dashboard/[username]", "layout");
    // revalidatePath("/dashboard/[username]/posts", "page");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}
