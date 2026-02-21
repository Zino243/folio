import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, FolderOpen, Star, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const { data: portfolios } = await supabase
    .from('portfolios')
    .select('id')
    .eq('user_id', user.id)

  const portfolioIds = portfolios?.map(p => p.id) || []

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .in('portfolio_id', portfolioIds.length > 0 ? portfolioIds : [''])
    .order('created_at', { ascending: false })

  const stats = [
    {
      title: "Portfolios",
      value: (portfolios?.length || 0).toString(),
      subtitle: `${profile?.plan === "pro" ? 5 : 1} max`,
      icon: Briefcase,
    },
    {
      title: "Projects",
      value: (projects?.length || 0).toString(),
      subtitle: "Across all portfolios",
      icon: FolderOpen,
    },
    {
      title: "Featured",
      value: (projects?.filter((p: any) => p.featured).length || 0).toString(),
      subtitle: "Highlighted projects",
      icon: Star,
    },
    {
      title: "Total Views",
      value: "In progress",
      subtitle: "Coming soon",
      icon: Eye,
    },
  ]

  const recentProjects = projects?.slice(0, 4) || []

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {"Here's an overview of your portfolios and projects."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/portfolios/new">
          <Button>Create Portfolio</Button>
        </Link>
        <Link href="/dashboard/portfolios">
          <Button variant="outline">View Portfolios</Button>
        </Link>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {recentProjects.length > 0 ? (
            recentProjects.map((project: any) => (
              <Card key={project.id} className="border-border transition-colors hover:border-foreground/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{project.title}</h3>
                        {project.featured && (
                          <Badge variant="secondary" className="text-[10px]">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {project.description?.split("\n")[0]}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(project.technologies as string[])?.slice(0, 3).map((tech: string) => (
                      <Badge key={tech} variant="outline" className="text-[10px] font-normal">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">No projects yet. Create a portfolio and add your first project!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
