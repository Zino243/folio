interface Experiencia {
  empresa: string
  cargo: string
  descripcion: string
  sitio_web: string
  fecha_inicio: string
  fecha_fin: string | null
  actualmente_trabajando: boolean
}

interface PublicExperienciasProps {
  experiencias: Experiencia[]
  primaryColor?: string
}

export function PublicExperiencias({ experiencias, primaryColor = "#000000" }: PublicExperienciasProps) {
  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Experience
      </h2>
      <div className="space-y-8">
        {experiencias.map((exp, index) => (
          <div key={index} className="relative border-l pl-6" style={{ borderColor: `${primaryColor}30` }}>
            <div 
              className="absolute -left-1.5 top-1 h-3 w-3 rounded-full" 
              style={{ backgroundColor: primaryColor }}
            />
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium" style={{ color: primaryColor }}>{exp.cargo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {exp.empresa}
                    {exp.sitio_web && (
                      <a 
                        href={exp.sitio_web.startsWith('http') ? exp.sitio_web : `https://${exp.sitio_web}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-xs hover:underline"
                        style={{ color: primaryColor }}
                      >
                        ↗
                      </a>
                    )}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {exp.fecha_inicio} - {exp.actualmente_trabajando ? "Present" : exp.fecha_fin}
                </span>
              </div>
              {exp.descripcion && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exp.descripcion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
