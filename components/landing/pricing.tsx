import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect to get started",
    features: [
      "1 portfolio",
      "Up to 5 projects",
      "Public portfolio page",
      "Basic SEO",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    priceNote: "one-time payment",
    description: "For serious professionals",
    features: [
      "Up to 5 portfolios",
      "Unlimited projects",
      "Custom themes",
      "Advanced SEO",
      "Priority support",
      "Analytics dashboard",
      "Custom domain support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade when you are ready. No subscriptions, no hidden fees.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 transition-all ${
                plan.popular
                  ? "border-foreground bg-foreground text-primary-foreground shadow-xl"
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-6 rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.priceNote}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`} />
                    <span className={`text-sm ${plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button
                  className="w-full"
                  variant={plan.popular ? "secondary" : "default"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
