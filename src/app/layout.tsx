import type { Metadata } from 'next'
import { Yusei_Magic, Geist_Mono } from 'next/font/google'
import './globals.css'
import LayoutProvider from './components/LayoutProvider'
import { createClient } from '@/lib/supabase/server'

const yusei_magic = Yusei_Magic({
  weight: '400',
  variable: '--font-yusei-magic',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ねこあるき',
  description: '地域の猫スポットを共有しよう',
  openGraph: {
    title: 'ねこあるき',
    description: '地域の猫スポットを共有しよう',
    images: [
      {
        url: '/ogp.png',
        width: 1200,
        height: 1200,
        alt: 'ねこあるき',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'ねこあるき',
    description: '地域の猫スポットを共有しよう',
    images: ['/ogp.png'],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  let userWithProfile = null

  if (authUser) {
    // public.usersからプロフィール情報を取得
    const { data: profileData } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('user_id', authUser.id)
      .single()

    // 存在しない場合、挿入する（初回ログイン）
    if (!profileData) {
      const newUserProfile = {
        user_id: authUser.id,
        name: authUser.user_metadata.name || authUser.user_metadata.full_name || '名無しさん',
        avatar_url: authUser.user_metadata.avatar_url,
      }
      const { error } = await supabase.from('users').insert(newUserProfile)

      if (error) {
        console.error('Error inserting new user into public.users:', error)
        // エラーが発生しても、とりあえずメタデータでフォールバック
        userWithProfile = { ...authUser, ...{ name: newUserProfile.name, avatar_url: newUserProfile.avatar_url } }
      } else {
        // 挿入成功
        userWithProfile = { ...authUser, ...newUserProfile }
      }
    } else {
      // 既存ユーザーの場合は情報をマージ
      userWithProfile = { ...authUser, ...profileData }
    }
  }

  return (
    <html lang="ja">
      <body className={`${yusei_magic.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}>
        <LayoutProvider user={userWithProfile}>{children}</LayoutProvider>
      </body>
    </html>
  )
}
