'use client'

import { createContext, Dispatch, SetStateAction } from 'react'
import type { User } from '@supabase/supabase-js'
import type { AppUser } from '@/types/user' // AppUserをインポート

type LayoutContextType = {
  isMenuOpen: boolean
  setIsMenuOpen: (isOpen: boolean) => void
  isPostModalOpen: boolean
  setIsPostModalOpen: (isOpen: boolean) => void
  isPC: boolean
  user: AppUser | null // 型をAppUserに変更
  isLoginPromptOpen: boolean
  setIsLoginPromptOpen: Dispatch<SetStateAction<boolean>>
  isMapFullScreen: boolean
  setIsMapFullScreen: Dispatch<SetStateAction<boolean>>
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined)
