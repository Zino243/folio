import type { Project } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

interface PublicProjectGridProps {
  projects: Project[] | any[]
  username: string
  primaryColor?: string
}

export function PublicProjectGrid({ projects, username, primaryColor = "#000000" }: PublicProjectGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/${username}/${project.slug}`}
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          {/* Image placeholder */}
          <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-secondary transition-colors group-hover:bg-secondary/80">
            {project.cover_image || (project.images && project.images.length > 0) ? (
              <img 
                src={project.cover_image || project.images[0]} 
                alt={project.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <span 
                  className="text-3xl font-bold"
                  style={{ color: `${primaryColor}40` }}
                >
                  {project.title?.charAt(0) || "?"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start justify-between">
            <h3 
              className="font-semibold group-hover:underline group-hover:underline-offset-4"
              style={{ color: primaryColor }}
            >
              {project.title}
            </h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {project.description?.split("\n")[0]}
          </p>

          <div className="mt-4 flex flex-wrap gap-1">
            {(project.technologies as string[])?.slice(0, 3).map((tech: string) => (
              <Badge 
                key={tech} 
                variant="secondary" 
                className="text-[10px] font-normal"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                {tech}
              </Badge>
            ))}
            {(project.technologies as string[])?.length > 3 && (
              <Badge 
                variant="secondary" 
                className="text-[10px] font-normal"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                +{(project.technologies as string[]).length - 3}
              </Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
