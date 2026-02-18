import { PortfolioForm } from "@/components/dashboard/portfolio-form"

export default function NewPortfolioPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up a new portfolio to showcase your work.
        </p>
      </div>
      <PortfolioForm />
    </div>
  )
}
