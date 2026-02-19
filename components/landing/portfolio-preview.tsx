import { Badge } from "@/components/ui/badge"

const exampleProjects = [
  {
    title: "Vaultify",
    description: "A secure password manager with end-to-end encryption.",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  {
    title: "Taskflow",
    description: "Project management tool with real-time collaboration.",
    tags: ["React", "Node.js", "Socket.io"],
  },
  {
    title: "Weatherly",
    description: "Beautiful weather app with interactive maps.",
    tags: ["React Native", "TypeScript", "MapboxGL"],
  },
]

export function PortfolioPreview() {
  return (
    <section className="border-t border-border bg-secondary/50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            See it in action
          </h2>
          <p className="mt-4 text-muted-foreground">
            Here is what a portfolio built with Portlify looks like.
          </p>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {/* Browser frame */}
          <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
            </div>
            <div className="mx-auto rounded-md bg-background px-4 py-1 text-xs text-muted-foreground">
              portlify.online/Zino243
            </div>
          </div>

          {/* Portfolio preview content */}
          <div className="p-8 md:p-12">
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-lg font-bold text-primary-foreground">
                  A
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Aitor Sanchez</h3>
                  <p className="text-sm text-muted-foreground">Full-Stack Developer</p>
                </div>
              </div>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Passionate about building elegant solutions to complex problems. Specializing in React, Next.js, and TypeScript.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exampleProjects.map((project) => (
                <div
                  key={project.title}
                  className="rounded-lg border border-border bg-background p-5 transition-colors hover:border-foreground/20"
                >
                  <div className="mb-3 h-24 rounded-md bg-secondary" />
                  <h4 className="mb-1 font-medium text-foreground">{project.title}</h4>
                  <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
