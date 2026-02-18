import { notFound } from "next/navigation"
import { ProjectForm } from "@/components/dashboard/project-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function NewProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!portfolio) return notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href={`/dashboard/portfolios/${id}/projects`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new project to {portfolio.name}.
        </p>
      </div>
      <ProjectForm portfolioId={id} />
    </div>
  )
}
