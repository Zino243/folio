import { Users } from "lucide-react"

interface SoftSkill {
  nombre: string
  descripcion: string
}

interface PublicSoftSkillsProps {
  softSkills: SoftSkill[]
  primaryColor?: string
}

export function PublicSoftSkills({ softSkills, primaryColor = "#000000" }: PublicSoftSkillsProps) {
  if (softSkills.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Soft Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {softSkills.map((skill, index) => (
          <div
            key={index}
            className="group flex items-center gap-2 rounded-full border px-4 py-2 transition-all hover:border-transparent"
            style={{ 
              borderColor: `${primaryColor}30`,
              backgroundColor: `${primaryColor}08` 
            }}
          >
            <Users className="h-4 w-4" style={{ color: primaryColor }} />
            <span className="text-sm font-medium" style={{ color: primaryColor }}>
              {skill.nombre}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
