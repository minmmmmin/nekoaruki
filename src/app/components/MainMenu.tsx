'use client'

import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import Image from 'next/image'
import {
  HomeIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { LayoutContext } from '@/lib/contexts/LayoutContext'

type Props = {
  open: boolean
  onClose: () => void
}

export default function MainMenu({ open, onClose }: Props) {
  const router = useRouter()
  const layoutContext = useContext(LayoutContext)
  if (!layoutContext) {
    throw new Error('LayoutContext must be used within a LayoutProvider')
  }
  const { isPC, setIsPostModalOpen, user, setIsLoginPromptOpen } = layoutContext

  const go = (path: string) => {
    router.push(path)
    onClose()
  }

  const handlePostClick = () => {
    if (!user) {
      setIsLoginPromptOpen(true)
      onClose()
      return
    }
    if (isPC) {
      setIsPostModalOpen(true)
      onClose()
    } else {
      go('/post')
    }
  }

  const handleUserSettingsClick = () => {
    if (user) {
      go('/user-settings')
    } else {
      setIsLoginPromptOpen(true)
      onClose()
    }
  }

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 // 少し幅を広げる
          bg-base-100 shadow-lg p-2 z-50
          flex flex-col gap-1
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ top: '60px', height: 'calc(100% - 60px)' }}
      >
        {user && (
          <>
            <div className="flex items-center gap-4 p-4">
              <div className="avatar">
                <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <Image
                    src={user.avatar_url || '/images/dummycat.png'}
                    width={48}
                    height={48}
                    alt={user.name || 'アバター'}
                  />
                </div>
              </div>
              <div>
                <div className="font-bold text-lg">{user.name || 'Guest'}</div>
                <span className="text-sm text-base-content/70">{user.email}</span>
              </div>
            </div>
            <div className="divider my-0"></div>
          </>
        )}

        <ul className="menu p-2">
          <li>
            <a onClick={() => go('/')} className="text-base">
              <HomeIcon className="h-6 w-6" />
              ホーム
            </a>
          </li>
          <li>
            <a onClick={handlePostClick} className="text-base">
              <PencilSquareIcon className="h-6 w-6" />
              投稿する
            </a>
          </li>
        </ul>

        <div className="divider my-0"></div>

        <ul className="menu p-2">
          <li>
            <a onClick={handleUserSettingsClick} className="text-base">
              <Cog6ToothIcon className="h-6 w-6" />
              個人設定
            </a>
          </li>
          <li>
            <a onClick={() => go('/usage')} className="text-base">
              <QuestionMarkCircleIcon className="h-6 w-6" />
              使い方
            </a>
          </li>
        </ul>
      </aside>
    </>
  )
}
