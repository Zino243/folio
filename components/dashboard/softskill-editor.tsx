"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SoftSkillForm } from "@/components/dashboard/softskill-form"

export function SoftSkillEditor() {
  const [softSkills, setSoftSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('soft_skills')
        .select('*')
        .eq('user_id', user.id)
        .order('orden', { ascending: true })

      setSoftSkills(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <SoftSkillForm softSkills={softSkills} onChange={setSoftSkills} />
}
