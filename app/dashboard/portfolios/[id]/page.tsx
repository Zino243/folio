import { PortfolioForm } from "@/components/dashboard/portfolio-form"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your portfolio details and settings.
        </p>
      </div>
      <PortfolioForm portfolio={portfolio} />
    </div>
  )
}
