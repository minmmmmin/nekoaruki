import { createClient } from '@/lib/supabase/server'
import UserSettingsForm from './UserSettingsForm'

export default async function UserSetting() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('user_id', user.id).single()
    profile = data
  }

  return (
    <main className="bg-base-200 p-4 sm:p-8 w-full overflow-y-auto">
      <div className="max-w-2xl mx-auto bg-base-100 p-6 sm:p-10 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-8 text-center">ユーザー設定</h2>
        <UserSettingsForm user={user} profile={profile} />
      </div>
    </main>
  )
}
