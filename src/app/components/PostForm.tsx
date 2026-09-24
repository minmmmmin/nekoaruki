"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import SelectableMap from "./SelectableMap";
import { compressImage } from "@/lib/image/compressImage";
import { createPost } from "@/lib/posts/createPosts";

type PostFormProps = {
  onClose?: () => void; // モーダルを閉じるための関数
};

export default function PostForm({ onClose }: PostFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isPosting, setIsPosting] = useState(false); // Add this line

  // 画像プレビュー表示のためのURL生成
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 画像圧縮
  const handleImageSelect = async (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    try {
      const compressed = await compressImage(f);
      setFile(compressed);
    } catch (e) {
      console.error(e);
      alert("画像の圧縮に失敗しました");
    }
  };

  const handleSubmitPost = async () => {
    if (isPosting) return; // Prevent double submission

    try {
      if (!file) {
        alert("画像を選択してください");
        return;
      }

      if (!comment.trim()) {
        alert("コメントを入力してください");
        return;
      }

      if (!location) {
        alert("位置情報を選択してください");
        return;
      }

      setIsPosting(true); // Set posting state to true

      await createPost({
        caption: comment,
        latitude: location.lat,
        longitude: location.lng,
        imageFile: file,
      });


      alert("投稿しました");

      // 状態リセット（任意だが強くおすすめ）
      setComment("");
      setLocation(null);
      setFile(null);

      onClose?.();
    } catch (e) {
      console.error(e);
      alert(
        e instanceof Error ? e.message : "投稿に失敗しました"
      );
    } finally {
      setIsPosting(false); // Set posting state to false regardless of success or failure
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("お使いのブラウザは位置情報取得に対応していません。");
      return;
    }

    setIsGettingLocation(true);

    const handleError = () => {
      // Geolocation API 失敗時のフォールバック処理
      const confirmFallback = window.confirm("現在地の自動取得に失敗しました。\nIPアドレスからおおよその位置を推定しますか？（精度は低くなります）");
      if (confirmFallback) {
        fetch('http://ip-api.com/json')
          .then(res => {
            if (!res.ok) {
              throw new Error('Network response was not ok');
            }
            return res.json();
          })
          .then(data => {
            if (data.status === 'success' && data.lat && data.lon) {
              setLocation({ lat: data.lat, lng: data.lon });
            } else {
              throw new Error('Failed to get location from IP address.');
            }
          })
          .catch(err => {
            console.error("IP Geolocation Error:", err);
            alert("IPアドレスからの位置情報取得にも失敗しました。");
          })
          .finally(() => {
            setIsGettingLocation(false);
          });
      } else {
        setIsGettingLocation(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
      },
      handleError, // エラーハンドラを共通化
      {
        enableHighAccuracy: false,
        timeout: 5000, // タイムアウトを5秒に戻す（失敗すればフォールバックするため）
        maximumAge: 0,
      }
    );
  };


  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      <div className="flex-1 px-5 pt-6 pb-4 overflow-y-auto">
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">写真</h2>
          <label className="inline-flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer select-none text-sm shadow-sm hover:shadow-md">
            <input
              type="file"
              accept="image/*;capture=camera"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                handleImageSelect(f);
              }}
            />
            <span>画像をアップロードする</span>
          </label>

          <div className="mt-6">
            {previewUrl ? (
              <div className="relative w-full max-w-full h-56 md:h-72 bg-gray-100 border rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  src={previewUrl}
                  alt="preview"
                  fill
                  sizes="100vw"
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-full h-56 md:h-72 bg-gray-200 border rounded-md flex items-center justify-center text-gray-500">
                写真はここに表示されます
              </div>
            )}
          </div>
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">位置情報の追加</h2>
            <button
              type="button"
              className="btn btn-sm"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation || isPosting} // Disable during posting
            >
              {isGettingLocation ? "取得中..." : "現在地から設定"}
            </button>
          </div>
          <div className="w-full h-64 md:h-80 rounded-md overflow-hidden border">
            <SelectableMap
              value={location}
              onChange={setLocation}
            />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">コメント</h2>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを入力して下さい。"
            className="w-full h-28 border rounded-md p-3 resize-none"
            disabled={isPosting} // Disable during posting
          />
        </section>
      </div>

      <div className="px-5 pb-6 border-t pt-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            type="button"
            className="btn rounded-full px-6 py-3 shadow-sm"
            onClick={onClose} // onCloseを呼び出す
            disabled={isPosting} // Disable during posting
          >
            キャンセル
          </button>

          <div>
            <button
              type="button"
              className="btn btn-accent rounded-full px-6 py-3 shadow-sm"
              onClick={handleSubmitPost}
              disabled={isPosting} // Disable during posting
            >
              <div className="flex items-center gap-2">
                {isPosting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>投稿中...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                    <span>投稿する</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

