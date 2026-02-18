"use client"

import { useState, useEffect } from "react"
import { ProjectCard } from "@/components/dashboard/project-card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"

export default function ProjectsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [id, setId] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { id: portfolioId } = await params
      setId(portfolioId)
      await fetchData(portfolioId)
    }
    init()
  }, [params])

  const fetchData = async (portfolioId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const [{ data: portfolioData }, { data: projectsData }] = await Promise.all([
        supabase.from('portfolios').select('*').eq('id', portfolioId).eq('user_id', user.id).single(),
        supabase.from('projects').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false })
      ])

      if (!portfolioData) {
        notFound()
        return
      }

      setPortfolio(portfolioData)
      setProjects(projectsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/portfolios"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Portfolios
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {portfolio.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(projects?.length || 0)} project{(projects?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href={`/dashboard/portfolios/${id}/projects/new`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">No projects yet.</p>
          <Link href={`/dashboard/portfolios/${id}/projects/new`}>
            <Button className="mt-4 gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Add Your First Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects?.map((project: any) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              portfolioId={id}
              onUpdate={() => fetchData(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}