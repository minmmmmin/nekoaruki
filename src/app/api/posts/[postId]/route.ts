import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const postId = pathSegments[pathSegments.length - 1];

  if (!/^\d+$/.test(postId)) {
    return new NextResponse(JSON.stringify({ error: "Invalid Post ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUserClient = await createClient();
  const {
    data: { user },
  } = await supabaseUserClient.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseAdminClient = await createServiceClient();

  const { data: post, error: postError } = await supabaseAdminClient
    .from("posts")
    .select("user_id, image_url")
    .eq("post_id", postId)
    .single();

  if (postError || !post) {
    return new NextResponse(JSON.stringify({ error: "Post not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (post.user_id !== user.id) {
    return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (post.image_url) {
      const bucketName = "Images";
      const imageUrlParts = post.image_url.split(`${bucketName}/`);
      const imagePath = imageUrlParts.length > 1 ? imageUrlParts[1] : null;

      if (imagePath) {
        const { error: storageError } = await supabaseAdminClient.storage
          .from(bucketName)
          .remove([imagePath]);

        if (storageError) {
          console.error(
            `Error deleting image from storage: ${imagePath}`,
            storageError
          );
        }
      }
    }

    const { error: dbError } = await supabaseAdminClient
      .from("posts")
      .delete()
      .eq("post_id", postId);

    if (dbError) {
      throw new Error(
        `Failed to delete post from database: ${dbError.message}`
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete post process failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
