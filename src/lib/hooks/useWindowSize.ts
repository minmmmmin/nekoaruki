"use client";
import { useState, useEffect } from 'react';

// ウィンドウサイズを管理するカスタムフック
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // windowオブジェクトが存在する場合のみ実行
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // イベントリスナーを追加
      window.addEventListener('resize', handleResize);
      // 初回レンダリング時にサイズを取得
      handleResize();

      // コンポーネントのアンマウント時にイベントリスナーを削除
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}
