"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X, Plus, Award, Trash2 } from "lucide-react"
import { ImageUpload } from "./image-upload"

interface Certificacion {
  id: string
  nombre: string
  issuer: string
  fecha_obtencion: string
  url_certificado: string
  imagen_url: string
  orden: number
}

interface CertificacionFormProps {
  certificaciones: Certificacion[]
  onChange: (certificaciones: Certificacion[]) => void
}

export function CertificacionForm({ certificaciones, onChange }: CertificacionFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Certificacion>>({
    nombre: "",
    issuer: "",
    fecha_obtencion: "",
    url_certificado: "",
    imagen_url: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (editingId) {
        const { error } = await supabase
          .from('certificaciones')
          .update(formData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(certificaciones.map(cert => 
          cert.id === editingId ? { ...cert, ...formData } as Certificacion : cert
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('certificaciones')
          .insert({
            ...formData,
            user_id: user.id,
            orden: certificaciones.length,
          })
          .select()
        
        if (error) throw error
        
        if (data) {
          onChange([...certificaciones, data[0] as Certificacion])
        }
      }
      
      setFormData({
        nombre: "",
        issuer: "",
        fecha_obtencion: "",
        url_certificado: "",
        imagen_url: "",
      })
      setIsAdding(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleEdit = (cert: Certificacion) => {
    setFormData(cert)
    setEditingId(cert.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('certificaciones').delete().eq('id', id)
      if (error) throw error
      onChange(certificaciones.filter(cert => cert.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      nombre: "",
      issuer: "",
      fecha_obtencion: "",
      url_certificado: "",
      imagen_url: "",
    })
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-4 w-4" />
          Certifications
        </CardTitle>
        {!isAdding && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {certificaciones.length > 0 && !isAdding && (
          <div className="grid gap-3 sm:grid-cols-2">
            {certificaciones.map((cert) => (
              <div key={cert.id} className="flex items-start justify-between rounded-lg border p-3">
                <div className="flex gap-3">
                  {cert.imagen_url ? (
                    <img src={cert.imagen_url} alt={cert.nombre} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary">
                      <Award className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{cert.nombre}</p>
                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleEdit(cert)}>
                    <span className="text-xs">Edit</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(cert.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Certification Name</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="AWS Solutions Architect"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="Amazon Web Services"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_obtencion">Date Obtained</Label>
              <Input
                id="fecha_obtencion"
                type="date"
                value={formData.fecha_obtencion}
                onChange={(e) => setFormData({ ...formData, fecha_obtencion: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url_certificado">Certificate URL</Label>
              <Input
                id="url_certificado"
                value={formData.url_certificado}
                onChange={(e) => setFormData({ ...formData, url_certificado: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Badge/Image</Label>
              <ImageUpload
                bucket="portfolio-images"
                folder="certifications"
                value={formData.imagen_url || ""}
                onChange={(url) => setFormData({ ...formData, imagen_url: url })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Add Certification"}
              </Button>
            </div>
          </form>
        )}

        {certificaciones.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No certifications added yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
