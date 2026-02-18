interface Estudio {
  institucion: string
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string | null
  actualmente_estudiando: boolean
}

interface PublicEstudiosProps {
  estudios: Estudio[]
  primaryColor?: string
}

export function PublicEstudios({ estudios, primaryColor = "#000000" }: PublicEstudiosProps) {
  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Education
      </h2>
      <div className="space-y-8">
        {estudios.map((est, index) => (
          <div key={index} className="relative border-l pl-6" style={{ borderColor: `${primaryColor}30` }}>
            <div 
              className="absolute -left-1.5 top-1 h-3 w-3 rounded-full" 
              style={{ backgroundColor: primaryColor }}
            />
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium" style={{ color: primaryColor }}>{est.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{est.institucion}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {est.fecha_inicio} - {est.actualmente_estudiando ? "Present" : est.fecha_fin}
                </span>
              </div>
              {est.descripcion && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {est.descripcion}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
