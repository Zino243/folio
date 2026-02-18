import type { Portfolio } from "@/lib/mock-data"

interface PublicHeaderProps {
  portfolio: Portfolio | any
}

export function PublicHeader({ portfolio }: PublicHeaderProps) {
  const primaryColor = portfolio.primary_color || "#000000"
  const hasBanner = !!portfolio.banner_image
  
  return (
    <header className="border-b border-border bg-secondary/30">
      {/* Banner */}
      {hasBanner && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={portfolio.banner_image} 
            alt="Banner" 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className={`mx-auto max-w-4xl px-6 ${hasBanner ? 'py-8' : 'py-12'}`}>
        <div className={`flex items-center gap-4 ${hasBanner ? '-mt-12 relative z-10' : ''}`}>
          <div 
            className="h-24 w-24 rounded-full border-4 border-secondary/30 overflow-hidden flex items-center justify-center text-3xl font-bold shrink-0"
            style={{ backgroundColor: primaryColor, color: "white" }}
          >
            {portfolio.profile_image ? (
              <img 
                src={portfolio.profile_image} 
                alt={portfolio.name}
                className="h-full w-full object-cover"
              />
            ) : (
              portfolio.name?.charAt(0) || "?"
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {portfolio.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              /{portfolio.username}{portfolio.title && <> | {portfolio.title}</>}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
