import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; projectSlug: string }>
}): Promise<Metadata> {
  const { username, projectSlug } = await params
  const supabase = await createClient()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('username', username)
    .single()

  if (!portfolio) return { title: "Not Found" }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('portfolio_id', portfolio.id)
    .eq('slug', projectSlug)
    .single()

  if (!project) return { title: "Not Found" }

  return {
    title: `${project.title} - ${portfolio.name}`,
    description: project.description?.split("\n")[0],
  }
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ username: string; projectSlug: string }>
}) {
  const { username, projectSlug } = await params
  const supabase = await createClient()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('username', username)
    .single()

  if (!portfolio) return notFound()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('portfolio_id', portfolio.id)
    .eq('slug', projectSlug)
    .single()

  if (!project) return notFound()

  const primaryColor = portfolio.primary_color || "#000000"
  const allImages = [project.cover_image, ...(project.images || [])].filter(Boolean)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Link
            href={`/${username}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {portfolio.name}
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {project.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {(project.technologies as string[])?.map((tech: string) => (
              <Badge 
                key={tech} 
                variant="secondary"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {tech}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {project.project_url && (
              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                <Button className="gap-2" style={{ backgroundColor: primaryColor }}>
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </Button>
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </Button>
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  Source Code
                </Button>
              </a>
            )}
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {project.project_date && new Date(project.project_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Cover image / Gallery */}
        {allImages.length > 0 && (
          <div className="mb-12 space-y-4">
            {/* Main image */}
            <div className="aspect-video overflow-hidden rounded-xl border border-border">
              <img
                src={allImages[0]}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            </div>
            
            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.slice(1).map((img: string, index: number) => (
                  <div key={index} className="aspect-video overflow-hidden rounded-lg border border-border">
                    <img
                      src={img}
                      alt={`${project.title} ${index + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* If no images, show placeholder */}
        {allImages.length === 0 && (
          <div className="mb-12 aspect-video overflow-hidden rounded-xl border border-border bg-secondary">
            <div className="flex h-full items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
              <span 
                className="text-5xl font-bold"
                style={{ color: `${primaryColor}30` }}
              >
                {project.title?.charAt(0) || "?"}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="prose-like mx-auto max-w-2xl">
          {project.description?.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i} className="mb-6 leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-16 border-t border-border pt-8">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
        </div>

        {/* Built with Portlify */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Built with{" "}
            <a 
              href="/" 
              className="underline hover:no-underline"
              style={{ color: primaryColor }}
            >
              Portlify
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
