import { Layers, Zap, Globe } from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Multiple Portfolios",
    description:
      "Create separate portfolios for different audiences. Developers, designers, freelancers - organize your work your way.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description:
      "No complex configuration. Add your projects, customize your theme, and publish. Your portfolio is live in minutes.",
  },
  {
    icon: Globe,
    title: "Public Pages",
    description:
      "Every portfolio gets a clean, shareable URL. Optimized for SEO so recruiters and clients can find you effortlessly.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to stand out
          </h2>
          <p className="mt-4 text-muted-foreground">
            A focused toolkit for building professional portfolios that get results.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
