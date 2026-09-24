'use client'

import { useRouter } from 'next/navigation'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function LoginPromptModal({ isOpen, onClose }: Props) {
  const router = useRouter()

  if (!isOpen) {
    return null
  }

  const handleLogin = () => {
    onClose()
    router.push('/login')
  }

  return (
    <dialog className="modal modal-open z-[100]">
      <div className="modal-box">
        <h3 className="font-bold text-lg">ログインが必要です</h3>
        <p className="py-4">この機能を利用するにはログインしてください。</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            閉じる
          </button>
          <button className="btn btn-secondary" onClick={handleLogin}>
            ログイン
          </button>
        </div>
      </div>
      {/* Clicking outside closes the modal */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
