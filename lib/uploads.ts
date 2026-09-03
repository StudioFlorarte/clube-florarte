import { createClient } from './supabase/client'
export async function uploadImage(file: File, folder: 'covers' | 'avatars') {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('invalidFile')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('error')
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type]
  const path = `${folder}/${user.id}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('club-media').upload(path, file, { contentType: file.type })
  if (error) throw new Error('error')
  return `/api/media?path=${encodeURIComponent(path)}`
}
