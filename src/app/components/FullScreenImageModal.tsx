'use client'

import Image from 'next/image'
import { createPortal } from 'react-dom'

interface Props {
  imageUrl: string
  onClose: () => void
}

export default function FullscreenImageModal({ imageUrl, onClose }: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80"
      onClick={onClose} // 画像外クリックで閉じる
    >
      {/* 画像サイズにフィットするラッパー */}
      <div
        className="relative inline-block"
        onClick={(e) => e.stopPropagation()} // 画像内クリックは閉じない
      >
        <Image
          src={imageUrl}
          alt="拡大画像"
          width={1600}
          height={1200}
          className="max-h-[90vh] w-auto max-w-full rounded-lg object-contain"
        />

        {/* 閉じるボタン：必ず画像内右上 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  )
}
