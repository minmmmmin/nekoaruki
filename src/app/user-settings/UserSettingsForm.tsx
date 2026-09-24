'use client'

import { useState, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { useFormStatus } from 'react-dom'
import Image from 'next/image'
import ReactCrop, {
  type Crop,
  type PercentCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { createClient } from '@/lib/supabase/client'
import { updateUserAvatar, updateUserName } from './actions'
import LoginPromptModal from '../components/LoginPromptModal'
import { useRouter } from 'next/navigation'

// #region Helper functions
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

async function canvasPreview(image: HTMLImageElement, canvas: HTMLCanvasElement, crop: Crop) {
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const pixelRatio = window.devicePixelRatio
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)
  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()
  ctx.translate(-cropX, -cropY)
  ctx.translate(centerX, centerY)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )
  ctx.restore()
}
// #endregion

type Profile = {
  name: string
  avatar_url: string
}

type Props = {
  user: User | null
  profile: Profile | null
}

const initialState = {
  success: false,
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="btn btn-accent" disabled={pending}>
      {pending ? 'ユーザー名を更新中...' : 'ユーザー名を更新'}
    </button>
  )
}

export default function UserSettingsForm({ user, profile }: Props) {
  const router = useRouter()
  const [isLoginModalOpen, setLoginModalOpen] = useState(!user)
  const [responseState, setResponseState] = useState(initialState)
  const [showResultModal, setShowResultModal] = useState(false)
  const supabase = createClient()

  // Image crop states
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [aspect] = useState<number | undefined>(1)
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar_url || '')
  const [isTrimmingModalOpen, setTrimmingModalOpen] = useState(false)
  const [isAvatarUpdating, setAvatarUpdating] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)



  const handleCloseLoginModal = () => {
    setLoginModalOpen(false)
    router.push('/')
  }

  if (!user) {
    return <LoginPromptModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
  }

  const handleCloseResultModal = () => {
    setShowResultModal(false)
    // 成功時はリロードして、ヘッダーなどのUI全体を最新の状態に保つ
    if (responseState.success) {
      window.location.reload()
    }
  }

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined)
      const reader = new FileReader()
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(e.target.files[0])
      setTrimmingModalOpen(true)
    }
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  const handleCropComplete = async () => {
    const image = imgRef.current
    if (!image || !completedCrop) {
      return
    }

    const canvas = document.createElement('canvas')
    await canvasPreview(image, canvas, completedCrop)

    canvas.toBlob(async (blob) => {
      if (!blob) {
        throw new Error('Failed to create blob')
      }
      const file = new File([blob], 'avatar.webp', { type: 'image/webp' })

      setTrimmingModalOpen(false)
      setAvatarUpdating(true)
      setPreviewUrl(URL.createObjectURL(file)) // Optimistic UI update

      const formData = new FormData()
      formData.append('avatar', file)

      const result = await updateUserAvatar(formData)
      setResponseState(result)
      setShowResultModal(true)

      // 失敗した場合は、プレビューを元のURLに戻す
      if (!result.success) {
        setPreviewUrl(profile?.avatar_url || '')
      }
      setAvatarUpdating(false)
    }, 'image/webp', 0.9)
  }

  const handleNameSubmit = async (formData: FormData) => {
    const result = await updateUserName(formData)
    setResponseState(result)
    setShowResultModal(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.assign('/login')
  }


  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="avatar relative">
            {isAvatarUpdating && (
              <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 rounded-full z-10">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}
            <div className="w-24 rounded-full ring ring-accent-content ring-offset-base-100 ring-offset-2">
              <Image
                src={previewUrl || '/images/dummycat.png'}
                alt="Avatar preview"
                width={96}
                height={96}
                className="object-cover"
                key={previewUrl}
              />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onSelectFile}
            style={{ display: 'none' }}
            accept="image/*"
            disabled={isAvatarUpdating}
          />
          <button
            type="button"
            className="btn btn-accent btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAvatarUpdating}
          >
            画像を変更
          </button>
        </div>

        <div className="divider"></div>

        <form action={handleNameSubmit} className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">メールアドレス</span>
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="input input-bordered w-full bg-base-200"
            />
          </div>

          <div className="form-control w-full">
            <label className="label" htmlFor="name">
              <span className="label-text">ユーザー名</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={profile?.name || ''}
              className="input input-bordered w-full"
              placeholder="ねこマスター"
            />
          </div>
          <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <SubmitButton />
            <button type="button" className="btn btn-error btn-outline" onClick={handleLogout}>
              ログアウト
            </button>
          </div>
        </form>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <dialog id="result_modal" className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{responseState.success ? '成功' : 'エラー'}</h3>
            <p className="py-4">{responseState.message}</p>
            <div className="modal-action">
              <button className="btn" onClick={handleCloseResultModal}>
                閉じる
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Image Trimming Modal */}
      {isTrimmingModalOpen && (
        <dialog id="trimming_modal" className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg">
            <h3 className="font-bold text-lg mb-4">画像をトリミング</h3>
            <div className="flex justify-center">
              {imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_: Crop, percentCrop: PercentCrop) =>
                    setCrop(percentCrop)
                  }
                  onComplete={(c: Crop) => setCompletedCrop(c)}
                  aspect={aspect}
                  minWidth={100}
                  minHeight={100}
                >
                  <Image
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    onLoad={onImageLoad}
                    width={800}
                    height={600}
                    style={{ maxHeight: '70vh' }}
                  />
                </ReactCrop>
              )}
            </div>
            <div className="modal-action mt-4">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setTrimmingModalOpen(false)
                  setImgSrc('')
                }}
              >
                キャンセル
              </button>
              <button className="btn btn-accent" onClick={handleCropComplete}>
                決定
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
