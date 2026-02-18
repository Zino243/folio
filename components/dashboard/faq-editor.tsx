"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { FAQForm } from "@/components/dashboard/faq-form"

export function FAQEditor() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('faqs')
        .select('*')
        .eq('user_id', user.id)
        .order('orden', { ascending: true })

      setFaqs(data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return <FAQForm faqs={faqs} onChange={setFaqs} />
}
