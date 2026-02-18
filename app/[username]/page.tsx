import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public/public-header"
import { PublicProjectGrid } from "@/components/public/public-project-grid"
import { PublicFooter } from "@/components/public/public-footer"
import { PublicExperiencias } from "@/components/public/public-experiencias"
import { PublicEstudios } from "@/components/public/public-estudios"
import { PublicTecnologias } from "@/components/public/public-tecnologias"
import { PublicPosts } from "@/components/public/public-posts"
import { PublicCertificaciones } from "@/components/public/public-certificaciones"
import { PublicFAQs } from "@/components/public/public-faqs"
import { PublicSoftSkills } from "@/components/public/public-softskills"
import { PublicContact } from "@/components/public/public-contact"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('username', username)
    .single()

  if (!portfolio) return { title: "Not Found" }
  return {
    title: portfolio.seo_title || portfolio.name,
    description: portfolio.seo_description || portfolio.description,
  }
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('username', username)
    .single()

  if (!portfolio) return notFound()

  const userId = portfolio.user_id

  const [projectsResult, experienciasResult, estudiosResult, tecnologiasResult, postsResult, certificacionesResult, faqsResult, softSkillsResult] = await Promise.all([
    supabase.from('projects').select('*').eq('portfolio_id', portfolio.id).order('created_at', { ascending: false }),
    supabase.from('experiencias').select('*').eq('user_id', userId).order('fecha_inicio', { ascending: false }),
    supabase.from('estudios').select('*').eq('user_id', userId).order('fecha_inicio', { ascending: false }),
    supabase.from('tecnologias').select('*').eq('user_id', userId).order('orden', { ascending: true }),
    supabase.from('posts').select('*').eq('user_id', userId).eq('estado', 'publicado').order('published_at', { ascending: false }),
    supabase.from('certificaciones').select('*').eq('user_id', userId).order('orden', { ascending: true }),
    supabase.from('faqs').select('*').eq('user_id', userId).order('orden', { ascending: true }),
    supabase.from('soft_skills').select('*').eq('user_id', userId).order('orden', { ascending: true })
  ])

  const projects = projectsResult.data || []
  const experiencias = experienciasResult.data || []
  const estudios = estudiosResult.data || []
  const tecnologias = tecnologiasResult.data || []
  const posts = postsResult.data || []
  const certificaciones = certificacionesResult.data || []
  const faqs = faqsResult.data || []
  const softSkills = softSkillsResult.data || []

  const featuredProjects = projects.filter((p: any) => p.featured)
  const otherProjects = projects.filter((p: any) => !p.featured)
  const primaryColor = portfolio.primary_color || "#000000"

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader portfolio={portfolio} />

      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* About */}
        {portfolio.description && (
          <section className="mb-16">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              About
            </h2>
            <p className="max-w-2xl leading-relaxed text-foreground">
              {portfolio.description}
            </p>
          </section>
        )}

        {/* Soft Skills */}
        {softSkills.length > 0 && (
          <section className="mb-16">
            <PublicSoftSkills softSkills={softSkills} primaryColor={primaryColor} />
          </section>
        )}

        {/* Technologies */}
        {tecnologias.length > 0 && (
          <section className="mb-16">
            <PublicTecnologias tecnologias={tecnologias} primaryColor={primaryColor} />
          </section>
        )}

        {/* Experience */}
        {experiencias.length > 0 && (
          <section className="mb-16">
            <PublicExperiencias experiencias={experiencias} primaryColor={primaryColor} />
          </section>
        )}

        {/* Education */}
        {estudios.length > 0 && (
          <section className="mb-16">
            <PublicEstudios estudios={estudios} primaryColor={primaryColor} />
          </section>
        )}

        {/* Certifications */}
        {certificaciones.length > 0 && (
          <section className="mb-16">
            <PublicCertificaciones certificaciones={certificaciones} primaryColor={primaryColor} />
          </section>
        )}

        {/* Blog Posts */}
        {posts.length > 0 && (
          <section className="mb-16">
            <PublicPosts posts={posts} username={username} primaryColor={primaryColor} />
          </section>
        )}

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Featured Work
            </h2>
            <PublicProjectGrid projects={featuredProjects} username={username} primaryColor={primaryColor} />
          </section>
        )}

        {/* All Projects */}
        {otherProjects.length > 0 && (
          <section className="mb-16">
            <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {featuredProjects.length > 0 ? "Other Projects" : "Projects"}
            </h2>
            <PublicProjectGrid projects={otherProjects} username={username} primaryColor={primaryColor} />
          </section>
        )}

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="mb-16">
            <PublicFAQs faqs={faqs} primaryColor={primaryColor} />
          </section>
        )}

        {/* Contact */}
        {portfolio.contact_show && portfolio.contact_email && (
          <section className="mb-16">
            <PublicContact email={portfolio.contact_email} primaryColor={primaryColor} />
          </section>
        )}
      </main>

      <PublicFooter portfolio={portfolio} />
    </div>
  )
}
