import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
              folio
            </Link>
            <div className="flex gap-4">
              <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Features
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Pricing
              </Link>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {'2026 Folio. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
