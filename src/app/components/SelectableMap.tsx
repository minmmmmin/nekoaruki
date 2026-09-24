"use client";

import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  MapMouseEvent,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";

type LatLng = {
  lat: number;
  lng: number;
};

interface SelectableMapProps {
  value: LatLng | null;
  onChange: (latLng: LatLng) => void;
}

// 初期表示位置（今は日本大学文理学部）
const defaultCenter = {
  lat: 35.662186020148546,
  lng: 139.63409803900635,
};

function MapController({ value }: { value: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !value) return;
    map.setCenter(value);
    // ズームレベルも変更するとより親切
    // map.setZoom(15);
  }, [map, value]);

  return null;
}

export default function SelectableMap({
  value,
  onChange,
}: SelectableMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-600 font-bold">
          Google Maps APIキーが設定されていません
        </div>
      </div>
    );
  }

  const handleClick = (e: MapMouseEvent) => {
    if (!e.detail.latLng) return;

    onChange({
      lat: e.detail.latLng.lat,
      lng: e.detail.latLng.lng,
    });
  };

  return (
    <div className="relative w-full h-full">
      <APIProvider apiKey={apiKey}>
        <GoogleMap
          defaultCenter={defaultCenter}
          defaultZoom={15}
          mapId={mapId}
          gestureHandling="greedy"
          onClick={handleClick}
          streetViewControl={false}
          mapTypeControl={false}
          fullscreenControl={false}
          clickableIcons={false}
          cameraControl={false}
        >

          {value &&
            <AdvancedMarker position={value}>
              <div
                style={{
                  position: 'relative',
                  width: 0,
                  height: 0,
                }}
              >
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
            </AdvancedMarker>}
          <MapController value={value} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
