"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function AuthSessionHandler() {
  const supabase = createClient()

  useEffect(() => {
    const handleSignOut = async () => {
      await supabase.auth.signOut()
    }
    handleSignOut()
  }, [supabase])

  return null
}
