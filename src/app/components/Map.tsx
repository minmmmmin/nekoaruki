"use client";

import { APIProvider, Map as GoogleMap, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Dispatch, SetStateAction, useEffect, useState, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import { Post } from "@/types/post";
import { LayoutContext } from "@/lib/contexts/LayoutContext";
import Image from "next/image";
import { MapPinIcon } from "@heroicons/react/24/outline";

interface MapProps {
  view?: "split" | "map" | "timeline";
  setView?: Dispatch<SetStateAction<"split" | "map" | "timeline">>;
  onPinClick?: (post: Post) => void;
  center?: { lat: number; lng: number } | null;
  onCenterChange: (center: { lat: number; lng: number }) => void;
  isPC: boolean;
}

type FetchedPost = {
  post_id: number;
  user_id: string;
  caption: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  users: { name: string; avatar_url: string | null } | null;
  comments: { count: number }[] | null;
};

type FavoriteRow = {
  post_id: number;
  user_id: string;
};

function MapInner({ center }: { center?: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !center) return;
    map.setCenter(center);
  }, [map, center]);

  return null;
}

export default function NekoMap({view, setView, onPinClick, center, onCenterChange, isPC}: MapProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const layoutContext = useContext(LayoutContext);
  if (!layoutContext) {
    throw new Error("LayoutContext must be used within a LayoutProvider");
  }
  const { isMapFullScreen, setIsMapFullScreen } = layoutContext;

  useEffect(() => {
    const supabase = createClient();
    const fetchPosts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          post_id,
          user_id,
          caption,
          image_url,
          latitude,
          longitude,
          created_at,
          users!posts_user_id_fkey (
            name,
            avatar_url
          ),
          comments!post_id(count)
        `
        )
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      if (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
        return;
      }

      const rows = (data as unknown as FetchedPost[] | null) ?? [];
      if (rows.length === 0) {
        setPosts([]);
        return;
      }

      const postIds = rows.map((r) => r.post_id);
      const { data: favData, error: favError } = await supabase.from("favorites").select("post_id, user_id").in("post_id", postIds);

      if (favError) {
        console.error("Error fetching favorites:", favError);
      }

      const favs = (favData as FavoriteRow[] | null) ?? [];
      const likeCountMap = new Map<number, number>();
      const likedSet = new Set<number>();

      for (const f of favs) {
        likeCountMap.set(f.post_id, (likeCountMap.get(f.post_id) ?? 0) + 1);
        if (user && f.user_id === user.id) likedSet.add(f.post_id);
      }

      const mappedPosts: Post[] = rows.map((row) => ({
        post_id: row.post_id,
        user_id: row.user_id,
        created_at: row.created_at,
        latitude: row.latitude,
        longitude: row.longitude,
        image_url: row.image_url,
        caption: row.caption,
        username: row.users?.name ?? "unknown",
        avatar_url: row.users?.avatar_url ?? undefined,
        location: undefined,
        likeCount: likeCountMap.get(row.post_id) ?? 0,
        isLiked: likedSet.has(row.post_id),
        commentCount: row.comments?.[0]?.count ?? 0,
        replies: [],
      }));

      setPosts(mappedPosts);
    };

    fetchPosts();
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("お使いのブラウザは位置情報取得に対応していません。");
      return;
    }

    setIsGettingLocation(true);

    const handleError = () => {
      const confirmFallback = window.confirm(
        "現在地の自動取得に失敗しました。\nIPアドレスからおおよその位置を推定しますか？（精度は低くなります）"
      );
      if (confirmFallback) {
        fetch("http://ip-api.com/json")
          .then((res) => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
          })
          .then((data) => {
            if (data.status === "success" && data.lat && data.lon) {
              onCenterChange({ lat: data.lat, lng: data.lon });
            } else {
              throw new Error("Failed to get location from IP address.");
            }
          })
          .catch((err) => {
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
        onCenterChange({ lat: latitude, lng: longitude });
        setIsGettingLocation(false);
      },
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const markers = posts
    .filter(post => post.latitude && post.longitude)
    .map(post => (
      <AdvancedMarker
        key={post.post_id}
        position={{ lat: post.latitude!, lng: post.longitude! }}
        onClick={() => onPinClick?.(post)}
      >
        {/* 座標の基準点になるラッパー */}
        <div
          style={{
            position: 'relative',
            width: 0,
            height: 0,
          }}
        >
          {/* 実際のピン画像 */}
          <img
            src="/cat-pin.png"
            alt="cat pin"
            width={60}
            height={60}
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              transform: 'translate(-50%, 0)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          />
        </div>
      </AdvancedMarker>
    ));


  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-2">Google Maps APIキーが設定されていません。</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* 左上：現在地 */}
      <button
        onClick={handleGetCurrentLocation}
        disabled={isGettingLocation}
        className="absolute top-4 left-4 z-10 btn btn-square btn-secondary shadow-lg"
        title="現在地を取得"
      >
        {isGettingLocation ? <span className="loading loading-spinner"></span> : <MapPinIcon className="w-6 h-6" />}
      </button>

      {/* 右上：全画面 */}
      <button
        onClick={() => {
          setIsMapFullScreen((prev) => !prev);
          if (setView) {
            setView(view === 'map' ? 'split' : 'map');
          }
        }}
        className="absolute top-4 right-4 z-10 bg-white backdrop-blur-sm p-2 rounded-md shadow-lg hover:bg-white cursor-pointer"
        aria-label={isMapFullScreen ? "地図を元のサイズに戻す" : "地図を全画面表示"}
      >
        {isMapFullScreen ? (
          <Image src="/fullscreen_close_icon.png" alt="元のサイズに戻す" width={24} height={24} />
        ) : (
          <Image src="/fullscreen_icon.png" alt="全画面表示" width={24} height={24} />
        )}
      </button>

      <APIProvider apiKey={apiKey}>
        <GoogleMap
          defaultCenter={{ lat: 35.662186020148546, lng: 139.63409803900635 }}
          defaultZoom={15}
          mapId={mapId}
          gestureHandling={"greedy"}
          disableDefaultUI={false}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
          zoomControl={false}
          cameraControl={false}
        >
          <MapInner center={center} />
          {markers}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
