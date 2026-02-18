"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { EstudioForm } from "@/components/dashboard/estudio-form"

export function EstudioEditor() {
  const [estudios, setEstudios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('estudios')
        .select('*')
        .eq('user_id', user.id)
        .order('orden', { ascending: true })

      setEstudios(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <EstudioForm estudios={estudios} onChange={setEstudios} />
}
