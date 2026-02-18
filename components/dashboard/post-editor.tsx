"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { PostForm } from "@/components/dashboard/post-form"

export function PostEditor() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setPosts(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <PostForm posts={posts} onChange={setPosts} />
}
