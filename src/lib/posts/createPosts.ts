"use client";

import { createClient } from "@/lib/supabase/client";

type CreatePostInput = {
  caption: string;
  latitude: number | null;
  longitude: number | null;
  imageFile?: File | null;
};

export async function createPost({
  caption,
  latitude,
  longitude,
  imageFile,
}: CreatePostInput) {
  const supabase = createClient();

  // ログインユーザー取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("ログインしてください");
  }

  let imageUrl: string | null = null;

  // ① 画像がある場合は Storage にアップロード
  if (imageFile) {
    const ext = imageFile.name.split(".").pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("Images")
      .upload(fileName, imageFile, {
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // ② public URL を取得
    const { data } = supabase.storage
      .from("Images")
      .getPublicUrl(fileName);

    imageUrl = data.publicUrl;
  }

  // ③ posts に insert
  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      caption,
      latitude,
      longitude,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return post;
}
