"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CertificacionForm } from "@/components/dashboard/certificacion-form"

export function CertificacionEditor() {
  const [certificaciones, setCertificaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('certificaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('orden', { ascending: true })

      setCertificaciones(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <CertificacionForm certificaciones={certificaciones} onChange={setCertificaciones} />
}
