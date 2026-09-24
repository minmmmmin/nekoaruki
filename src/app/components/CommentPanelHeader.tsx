'use client'

import { useRef } from 'react'
import type { SortType } from '@/lib/hooks/useComments'

interface CommentPanelHeaderProps {
  loading: boolean
  commentCount: number
  sort: SortType
  setSort: (sort: SortType) => void
  onClose: () => void
}

const CommentPanelHeader = ({ loading, commentCount, sort, setSort, onClose }: CommentPanelHeaderProps) => {
  const detailsRef = useRef<HTMLDetailsElement | null>(null)

  const choose = (next: SortType) => {
    setSort(next)
    detailsRef.current?.removeAttribute('open')
  }

  return (
    <div className="sticky top-0 z-10 bg-base-100/95 backdrop-blur border-b border-base-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-base">コメント</div>
            <div className="text-xs text-base-content/60">
              {loading ? '読み込み中…' : `${commentCount} 件`}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <details ref={detailsRef} className="dropdown">
              <summary className="btn btn-ghost btn-sm gap-2 list-none">
                <span className="text-sm">並び替え</span>
                <span className="text-sm text-base-content/70">{sort === 'popular' ? '人気順' : '新着順'}</span>
                <span aria-hidden>▾</span>
              </summary>

              <ul className="dropdown-content menu bg-base-100 rounded-box shadow p-1 w-44 border border-base-200">
                <li>
                  <button
                    type="button"
                    className={sort === 'popular' ? 'active' : ''}
                    onClick={() => choose('popular')}
                  >
                    人気順
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={sort === 'new' ? 'active' : ''}
                    onClick={() => choose('new')}
                  >
                    新着順
                  </button>
                </li>
              </ul>
            </details>
          </div>
        </div>

        <button type="button" onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
          <span aria-hidden>✕</span>
        </button>
      </div>

      {/* mobile sort row */}
      <div className="sm:hidden px-4 pb-3">
        <div className="join w-full">
          <button
            type="button"
            className={['btn btn-sm join-item w-1/2', sort === 'popular' ? 'btn-active' : 'btn-ghost'].join(' ')}
            onClick={() => setSort('popular')}
          >
            人気順
          </button>
          <button
            type="button"
            className={['btn btn-sm join-item w-1/2', sort === 'new' ? 'btn-active' : 'btn-ghost'].join(' ')}
            onClick={() => setSort('new')}
          >
            新着順
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommentPanelHeader
