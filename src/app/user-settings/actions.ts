'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * ユーザーのアバター画像を更新する
 */
export async function updateUserAvatar(
  formData: FormData,
): Promise<{ success: boolean; message: string; avatarUrl?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'ユーザー認証に失敗しました。' }
  }

  // 古いアバターのURLを取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single()

  if (userError) {
    console.error('Error fetching user data:', userError)
    return { success: false, message: 'ユーザー情報の取得に失敗しました。' }
  }
  const oldAvatarUrl = userData?.avatar_url

  const avatarFile = formData.get('avatar') as File | null

  if (!avatarFile || avatarFile.size === 0) {
    return { success: false, message: '画像ファイルがありません。' }
  }

  const filePath = `avatars/${user.id}/${Date.now()}.webp`

  const { error: uploadError } = await supabase.storage.from('profile').upload(filePath, avatarFile, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return { success: false, message: `アバターのアップロードに失敗しました: ${uploadError.message}` }
  }

  const { data: publicUrlData } = supabase.storage.from('profile').getPublicUrl(filePath)

  if (!publicUrlData.publicUrl) {
    // アップロードに失敗した場合は、アップロードしたファイルを削除する
    await supabase.storage.from('profile').remove([filePath])
    return { success: false, message: 'アバターURLの取得に失敗しました。' }
  }

  const avatarUrl = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('Error updating avatar_url:', updateError)
    // URL更新に失敗した場合は、アップロードしたファイルを削除する
    await supabase.storage.from('profile').remove([filePath])
    return { success: false, message: `アバターURLの更新に失敗しました: ${updateError.message}` }
  }

  // 古いアバターを削除
  if (oldAvatarUrl) {
    try {
      const oldAvatarPath = oldAvatarUrl.split('/profile/')[1].split('?')[0]
      if (oldAvatarPath) {
        const { error: removeError } = await supabase.storage.from('profile').remove([oldAvatarPath])
        if (removeError) {
          console.error('Error removing old avatar:', removeError)
          // ここではエラーを返さない（メインの処理は成功しているため）
        }
      }
    } catch (e) {
      console.error('Error parsing old avatar path:', e)
    }
  }

  revalidatePath('/', 'layout')

  return { success: true, message: 'アバターを更新しました。', avatarUrl }
}

/**
 * ユーザー名を更新する
 */
export async function updateUserName(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'ユーザー認証に失敗しました。' }
  }

  const name = formData.get('name') as string

  if (!name) {
    return { success: false, message: 'ユーザー名が入力されていません。' }
  }

  const { error: updateError } = await supabase.from('users').update({ name }).eq('user_id', user.id)

  if (updateError) {
    console.error('Error updating user name:', updateError)
    return { success: false, message: `ユーザー名の更新に失敗しました: ${updateError.message}` }
  }

  revalidatePath('/', 'layout')

  return { success: true, message: 'ユーザー名を更新しました。' }
}
