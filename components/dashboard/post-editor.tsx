"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostForm } from "@/components/dashboard/post-form"

interface Profile {
  blog_posts_limit: number
}

export function PostEditor() {
  const [posts, setPosts] = useState<any[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data }] = await Promise.all([
        supabase.from('profiles').select('blog_posts_limit').eq('id', user.id).single(),
        supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      setProfile(profileData)
      setPosts(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <PostForm posts={posts} onChange={setPosts} blogLimit={profile?.blog_posts_limit || 0} />
}
