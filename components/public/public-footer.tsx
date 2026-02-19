import type { Portfolio } from "@/lib/mock-data"
import { Github, Twitter, Linkedin, Globe } from "lucide-react"

interface PublicFooterProps {
  portfolio: Portfolio | any
}

const socialIcons = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  website: Globe,
}

export function PublicFooter({ portfolio }: PublicFooterProps) {
  const socials = [
    { key: 'twitter', url: portfolio.social_twitter },
    { key: 'github', url: portfolio.social_github },
    { key: 'linkedin', url: portfolio.social_linkedin },
    { key: 'website', url: portfolio.social_website },
  ].filter(({ url }) => url)

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center gap-6">
          {socials.length > 0 && (
            <div className="flex gap-4">
              {socials.map(({ key, url }) => {
                const Icon = socialIcons[key as keyof typeof socialIcons]
                if (!Icon) return null
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={key}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Built with{" "}
            <a href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
              portlify
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
