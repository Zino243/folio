import Link from "next/link"

interface Post {
  titulo: string
  contenido: string
  excerpt?: string
  slug: string
  imagen_destacada: string
  published_at: string | null
}

interface PublicPostsProps {
  posts: Post[]
  username: string
  primaryColor?: string
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1') // Code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
    .replace(/^[-*+]\s/gm, '') // List items
    .replace(/^\d+\.\s/gm, '') // Ordered list items
    .replace(/^>\s/gm, '') // Blockquotes
    .replace(/\|/g, '') // Tables
    .replace(/[-=]{3,}/g, '') // Table separators
    .replace(/\n{2,}/g, ' ') // Multiple newlines
    .replace(/\n/g, ' ')
    .trim()
}

export function PublicPosts({ posts, username, primaryColor = "#000000" }: PublicPostsProps) {
  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Blog
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((post, index) => {
          const preview = post.excerpt || stripMarkdown(post.contenido)
          
          return (
            <Link
              key={index}
              href={`/${username}/blog/${post.slug}`}
              className="group block overflow-hidden rounded-lg border border-border"
            >
              {post.imagen_destacada && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.imagen_destacada}
                    alt={post.titulo}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 
                  className="font-medium group-hover:underline"
                  style={{ color: primaryColor }}
                >
                  {post.titulo}
                </h3>
                {post.published_at && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {preview}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
