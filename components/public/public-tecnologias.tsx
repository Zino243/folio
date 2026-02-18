interface Tecnologia {
  nombre: string
  categoria: string
  nivel: string
  anos_experiencia: number | null
  imagen_url: string
}

interface PublicTecnologiasProps {
  tecnologias: Tecnologia[]
  primaryColor?: string
}

export function PublicTecnologias({ tecnologias, primaryColor = "#000000" }: PublicTecnologiasProps) {
  const grouped = tecnologias.reduce((acc, tech) => {
    const cat = tech.categoria || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tech)
    return acc
  }, {} as Record<string, Tecnologia[]>)

  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Skills & Technologies
      </h2>
      <div className="space-y-6">
        {Object.entries(grouped).map(([categoria, techs]) => (
          <div key={categoria}>
            <h3 className="mb-3 text-sm font-medium" style={{ color: primaryColor }}>{categoria}</h3>
            <div className="flex flex-wrap gap-2">
              {techs.map((tech, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
                  style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}08` }}
                >
                  {tech.imagen_url && (
                    <img
                      src={tech.imagen_url}
                      alt={tech.nombre}
                      className="h-4 w-4 object-contain"
                    />
                  )}
                  <span style={{ color: primaryColor }}>{tech.nombre}</span>
                  {tech.anos_experiencia && (
                    <span className="text-xs" style={{ color: `${primaryColor}80` }}>
                      {tech.anos_experiencia}y
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
