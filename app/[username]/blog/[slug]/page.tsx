import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}): Promise<Metadata> {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('username', username)
    .single()

  if (!portfolio) return { title: "Not Found" }

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('user_id', portfolio.user_id)
    .eq('estado', 'publicado')
    .single()

  if (!post) return { title: "Not Found" }

  return {
    title: `${post.titulo} - ${portfolio.name}`,
    description: post.excerpt || post.contenido?.substring(0, 160),
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}) {
  const { username, slug } = await params
  const supabase = await createClient()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('username', username)
    .single()

  if (!portfolio) return notFound()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('user_id', portfolio.user_id)
    .single()

  if (!post || post.estado !== 'publicado') return notFound()

  const primaryColor = portfolio.primary_color || "#000000"

  // Get all published posts for navigation
  const { data: allPosts } = await supabase
    .from('posts')
    .select('id, titulo, slug')
    .eq('user_id', portfolio.user_id)
    .eq('estado', 'publicado')
    .order('published_at', { ascending: false })

  const currentIndex = allPosts?.findIndex(p => p.id === post.id) ?? -1
  const prevPost = currentIndex < (allPosts?.length ?? 0) - 1 ? allPosts?.[currentIndex + 1] : null
  const nextPost = currentIndex > 0 ? allPosts?.[currentIndex - 1] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link
            href={`/${username}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {portfolio.name}
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.published_at && (
              <span>
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {post.reading_time && (
              <span>· {post.reading_time} min read</span>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {post.titulo}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {post.imagen_destacada && (
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 overflow-hidden rounded-xl border border-border">
            <img
              src={post.imagen_destacada}
              alt={post.titulo}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <article className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-500 prose-pre:bg-gray-900 prose-pre:text-gray-100">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4" style={{ color: primaryColor }}>{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4" style={{ color: primaryColor }}>{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-bold mt-6 mb-3" style={{ color: primaryColor }}>{children}</h3>,
              p: ({ children }) => <p className="mb-6 leading-relaxed">{children}</p>,
              a: ({ href, children }) => <a href={href} className="underline hover:no-underline" style={{ color: primaryColor }}>{children}</a>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-6 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-6 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 pl-4 italic my-6" style={{ borderColor: primaryColor }}>
                  {children}
                </blockquote>
              ),
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match && !className
                return isInline ? (
                  <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
              pre: ({ children }) => (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x mb-6">
                  {children}
                </pre>
              ),
            }}
          >
            {post.contenido}
          </ReactMarkdown>
        </article>

        {/* Navigation between posts */}
        <div className="mt-16 flex items-center justify-between border-t border-border pt-8">
          {prevPost ? (
            <Link
              href={`/${username}/blog/${prevPost.slug}`}
              className="group flex flex-col items-start"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Previous
              </span>
              <span 
                className="font-medium group-hover:underline"
                style={{ color: primaryColor }}
              >
                {prevPost.titulo}
              </span>
            </Link>
          ) : <div />}

          {nextPost ? (
            <Link
              href={`/${username}/blog/${nextPost.slug}`}
              className="group flex flex-col items-end text-right"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Next <ArrowRight className="h-3 w-3" />
              </span>
              <span 
                className="font-medium group-hover:underline"
                style={{ color: primaryColor }}
              >
                {nextPost.titulo}
              </span>
            </Link>
          ) : <div />}
        </div>

        {/* Back to blog */}
        <div className="mt-8 text-center">
          <Link
            href={`/${username}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to all posts
          </Link>
        </div>

        {/* Built with Portlify */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Built with{" "}
            <a 
              href="/" 
              className="underline hover:no-underline"
              style={{ color: primaryColor }}
            >
              Portlify
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
