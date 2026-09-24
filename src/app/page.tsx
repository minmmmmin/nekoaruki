"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NekoMap from "./components/Map";
import TabsBar from "./components/TabsBar";
import Timeline from "./components/Timeline";
import { LayoutContext } from "@/lib/contexts/LayoutContext";
import type { Post } from "@/types/post";
import PostCard from "./components/PostCard";
import FullscreenImageModal from "./components/FullScreenImageModal";
import CommentPanel from "./components/CommentPanel";

export default function Home() {
  const [view, setView] = useState<"split" | "map" | "timeline">("split");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const layoutContext = useContext(LayoutContext);
  if (!layoutContext) {
    throw new Error("LayoutContext must be used within a LayoutProvider");
  }
  const {
    isPC,
    setIsPostModalOpen,
    user,
    setIsLoginPromptOpen,
    isMapFullScreen,
    setIsMapFullScreen,
  } = layoutContext;
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);

  const [mapCenter, setMapCenter] = useState({
    lat: 35.662186020148546,
    lng: 139.63409803900635,
  });

  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (searchParams.get("login") === "success") {
      router.refresh();
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 0);
      // URLからクエリパラメータを削除
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  const handlePostButtonClick = () => {
    if (!user) {
      setIsLoginPromptOpen(true);
      return;
    }
    if (isPC) {
      setIsPostModalOpen(true);
    } else {
      router.push("/post");
    }
  };

  const handlePinClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleImageClick = (imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
  };

  const handleCommentClick = (postId: number) => {
    setSelectedPost(null); // 投稿詳細モーダルを閉じる
    setCommentingPostId(postId); // コメントパネルを開く
  };

  // 「地図で見る」の共通処理
  const handleMoveMap = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    if (!isPC) {
      setIsMapFullScreen(true);
      setView('map');
    }
  };

  return (
    <>
      {isPC ? (
        <>
          <div
            className={`transition-all duration-300 ease-in-out ${
              isMapFullScreen
                ? "w-0 opacity-0"
                : "w-128 h-full flex flex-col border-r border-gray-200"
            }`}
          >
            <TabsBar />
            <div className="flex-1 overflow-y-auto">
              <Timeline
                view="timeline"
                setView={setView}
                isPC={isPC}
                onMoveMap={handleMoveMap}
                onImageClick={handleImageClick}
              />
            </div>
          </div>
          <div className="flex-1 h-full">
            <NekoMap
              view="map"
              setView={setView}
              onPinClick={handlePinClick}
              center={mapCenter}
              onCenterChange={setMapCenter}
              isPC={isPC}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isMapFullScreen || view === "map"
                ? "flex-1"
                : view === "split"
                ? "h-1/2"
                : "h-0"
            }`}
          >
            <NekoMap
              view={view}
              setView={setView}
              onPinClick={handlePinClick}
              center={mapCenter}
              onCenterChange={setMapCenter}
              isPC={isPC}
            />
          </div>
          <div
            className={`${isMapFullScreen || view === "map" ? "hidden" : ""}`}
          >
            <TabsBar />
          </div>
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isMapFullScreen
                ? "h-0"
                : view === "split"
                ? "flex-1 min-h-0"
                : view === "timeline"
                ? "flex-1 min-h-0"
                : "h-0"
            }`}
          >
            <Timeline
              view={view}
              setView={setView}
              isPC={isPC}
              onMoveMap={handleMoveMap}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      )}

      {/* 右下の投稿ボタン */}
      <button
        onClick={handlePostButtonClick}
        className=" fixed right-6 bottom-6 z-50 btn btn-accent flex items-center gap-2 px-5 py-4 rounded-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      </button>

      {/* ログイン成功モーダル */}
      {showSuccessModal && (
        <dialog id="login_success_modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">お知らせ</h3>
            <p className="py-4">ログインしました。</p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowSuccessModal(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* ピンクリック時の詳細表示モーダル */}
      {selectedPost && (
        <dialog
          id="post_details_modal"
          className="modal modal-open"
          onClick={() => setSelectedPost(null)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <PostCard
              post={selectedPost}
              onMoveMap={(lat, lng) => {
                handleMoveMap(lat, lng);
                setSelectedPost(null);
              }}
              onCommentClick={handleCommentClick}
              onImageClick={handleImageClick}
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedPost(null)}>
                閉じる
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* コメントパネル */}
      {commentingPostId !== null && (
        <CommentPanel
          postId={commentingPostId}
          onClose={() => setCommentingPostId(null)}
        />
      )}

      {/*画像拡大表示のモーダル*/}
      {fullscreenImageUrl && (
        <FullscreenImageModal
          imageUrl={fullscreenImageUrl}
          onClose={() => setFullscreenImageUrl(null)}
        />
      )}
    </>
  );
}
