import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const features = [
  "1 portfolio",
  "Up to 5 projects",
  "Public portfolio page",
  "Basic SEO",
  "Community support",
]

const paidFeatures = [
  "Add more projects",
  "Add blog posts",
  "Custom themes [ in process ]",
  "Custom domain support [ in process ]",
  "Analytics dashboard [ in process ]",
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to showcase your work
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start for free. Add projects and posts whenever you need.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="text-lg font-semibold text-foreground">
              Included for Free
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to get started with your professional portfolio
            </p>

            <ul className="my-8 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-foreground">
                Expand Anytime
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Purchase additional projects or blog posts as you need them
              </p>

              <ul className="my-8 space-y-3">
                {paidFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/register">
              <Button className="w-full" size="lg">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
