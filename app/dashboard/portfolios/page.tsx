"use client"

import { useState, useEffect } from "react"
import { PortfolioCard } from "@/components/dashboard/portfolio-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function PortfoliosPage() {
  const router = useRouter()
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const [{ data: profileData }, { data: portfoliosData }] = await Promise.all([
        supabase.from('profiles').select('portfolios_limit').eq('id', user.id).single(),
        supabase.from('portfolios').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])

      setProfile(profileData)
      setPortfolios(portfoliosData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const maxPortfolios = profile?.portfolios_limit || 1
  const canCreate = portfolios.length < maxPortfolios

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Portfolios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {portfolios.length} of {maxPortfolios} portfolios used
          </p>
        </div>
        {canCreate ? (
          <Link href="/dashboard/portfolios/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Portfolio
            </Button>
          </Link>
        ) : (
          <Button disabled className="gap-2">
            <Plus className="h-4 w-4" />
            Limit Reached
          </Button>
        )}
      </div>

      {/* Plan limit indicator */}
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{ width: `${(portfolios.length / maxPortfolios) * 100}%` }}
        />
      </div>

      {/* Portfolio cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {portfolios.length > 0 ? (
          portfolios.map((portfolio: any) => (
            <PortfolioCard 
              key={portfolio.id} 
              portfolio={portfolio} 
              onUpdate={fetchData}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">No portfolios yet. Create your first portfolio!</p>
          </div>
        )}
      </div>
    </div>
  )
}