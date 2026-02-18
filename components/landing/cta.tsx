import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="border-t border-border bg-secondary/50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to showcase your work?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of developers who use Folio to present their best projects. Free to start.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" className="gap-2 px-8">
                Create Your Portfolio
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
