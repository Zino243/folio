import { Award } from "lucide-react"

interface Certificacion {
  nombre: string
  issuer: string
  fecha_obtencion: string
  url_certificado: string
  imagen_url: string
}

interface PublicCertificacionesProps {
  certificaciones: Certificacion[]
  primaryColor?: string
}

export function PublicCertificaciones({ certificaciones, primaryColor = "#000000" }: PublicCertificacionesProps) {
  if (certificaciones.length === 0) return null

  return (
    <section>
      <h2 className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Certifications
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certificaciones.map((cert, index) => (
          <a
            key={index}
            href={cert.url_certificado ? (cert.url_certificado.startsWith('http') ? cert.url_certificado : `https://${cert.url_certificado}`) : '#'}
            target={cert.url_certificado ? "_blank" : "_self"}
            rel={cert.url_certificado ? "noopener noreferrer" : undefined}
            className="group flex items-start gap-4 rounded-lg border border-border p-4 transition-all hover:border-transparent hover:shadow-md"
            style={{ '--tw-shadow-color': `${primaryColor}20` } as any}
          >
            {cert.imagen_url ? (
              <img 
                src={cert.imagen_url} 
                alt={cert.nombre}
                className="h-12 w-12 rounded object-cover"
              />
            ) : (
              <div 
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Award className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
            )}
            <div className="space-y-1">
              <h3 className="font-medium text-sm leading-tight" style={{ color: primaryColor }}>
                {cert.nombre}
              </h3>
              <p className="text-xs text-muted-foreground">{cert.issuer}</p>
              {cert.fecha_obtencion && (
                <p className="text-xs text-muted-foreground">
                  {new Date(cert.fecha_obtencion).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                  })}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
