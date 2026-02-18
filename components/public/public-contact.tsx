import { Mail } from "lucide-react"

interface PublicContactProps {
  email?: string
  primaryColor?: string
}

export function PublicContact({ email, primaryColor = "#000000" }: PublicContactProps) {
  if (!email) return null

  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Contact
      </h2>
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all hover:border-transparent hover:shadow-md"
        style={{ 
          borderColor: primaryColor,
          color: primaryColor 
        }}
      >
        <Mail className="h-4 w-4" />
        {email}
      </a>
    </section>
  )
}
