"use client";

import { useRouter } from "next/navigation";
import PostForm from "../components/PostForm";

export default function PostPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col flex-1">
      <PostForm onClose={() => router.back()} />
    </main>
  );
}
