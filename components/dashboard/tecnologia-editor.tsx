"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { TecnologiaForm } from "@/components/dashboard/tecnologia-form"

export function TecnologiaEditor() {
  const [tecnologias, setTecnologias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('tecnologias')
        .select('*')
        .eq('user_id', user.id)
        .order('orden', { ascending: true })

      setTecnologias(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <TecnologiaForm tecnologias={tecnologias} onChange={setTecnologias} />
}
