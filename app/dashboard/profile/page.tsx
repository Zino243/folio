import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExperienciaEditor } from "@/components/dashboard/experiencia-editor"
import { EstudioEditor } from "@/components/dashboard/estudio-editor"
import { TecnologiaEditor } from "@/components/dashboard/tecnologia-editor"
import { PostEditor } from "@/components/dashboard/post-editor"
import { CertificacionEditor } from "@/components/dashboard/certificacion-editor"
import { FAQEditor } from "@/components/dashboard/faq-editor"
import { SoftSkillEditor } from "@/components/dashboard/softskill-editor"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your portfolio information
        </p>
      </div>

      <ExperienciaEditor />
      <EstudioEditor />
      <CertificacionEditor />
      <TecnologiaEditor />
      <SoftSkillEditor />
      <FAQEditor />
      <PostEditor />
    </div>
  )
}
