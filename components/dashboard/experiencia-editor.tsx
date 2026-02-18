"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ExperienciaForm } from "@/components/dashboard/experiencia-form"

interface Experiencia {
  id: string
  empresa: string
  cargo: string
  descripcion: string
  sitio_web: string
  fecha_inicio: string
  fecha_fin: string | null
  actualmente_trabajando: boolean
  orden: number
}

export function ExperienciaEditor() {
  const [experiencias, setExperiencias] = useState<Experiencia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('experiencias')
        .select('*')
        .eq('user_id', user.id)
        .order('orden', { ascending: true })

      setExperiencias(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <ExperienciaForm experiencias={experiencias} onChange={setExperiencias} />
}
