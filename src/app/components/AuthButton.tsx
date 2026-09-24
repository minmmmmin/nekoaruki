'use client'

import Link from 'next/link'
import Image from 'next/image'

import type { AppUser } from '@/types/user'

type Props = {
  user: AppUser | null
}

export default function AuthButton({ user }: Props) {
  return (
    <>
      {user ? (
        <Link href="/user-settings">
          <div className="avatar">
            <div className="w-9 h-9 rounded-full ring ring-gray-300 cursor-pointer overflow-hidden">
              <Image
                src={user.avatar_url || '/images/dummycat.png'}
                alt={user.name || 'user avatar'}
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
          </div>
        </Link>
      ) : (
        <Link href="/login" className="btn btn-secondary btn-sm">
          ログイン
        </Link>
      )}
    </>
  )
}
