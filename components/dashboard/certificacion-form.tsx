"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { X, Plus, Award, Trash2, GripVertical } from "lucide-react"
import { ImageUpload } from "./image-upload"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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

function SortableCertificacion({ 
  certificacion, 
  onEdit, 
  onDelete 
}: { 
  certificacion: Certificacion
  onEdit: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certificacion.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded mt-1"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 flex items-start justify-between rounded-lg border p-3">
        <div className="flex gap-3">
          {certificacion.imagen_url ? (
            <img src={certificacion.imagen_url} alt={certificacion.nombre} className="h-12 w-12 rounded object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-secondary">
              <Award className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-1">
            <p className="font-medium text-sm">{certificacion.nombre}</p>
            <p className="text-xs text-muted-foreground">{certificacion.issuer}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={onEdit}>
            <span className="text-xs">Edit</span>
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CertificacionForm({ certificaciones, onChange }: CertificacionFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Certificacion>>({
    nombre: "",
    issuer: "",
    fecha_obtencion: "",
    url_certificado: "",
    imagen_url: "",
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const normalizeUrl = (url: string) => {
    if (!url) return ""
    return url.startsWith('http') ? url : `https://${url}`
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = certificaciones.findIndex((c) => c.id === active.id)
      const newIndex = certificaciones.findIndex((c) => c.id === over.id)
      
      const newOrder = arrayMove(certificaciones, oldIndex, newIndex)
      
      const reorderedWithOrder = newOrder.map((cert, index) => ({
        ...cert,
        orden: index,
      }))

      onChange(reorderedWithOrder)

      const supabase = createClient()
      await Promise.all(
        reorderedWithOrder.map((cert) =>
          supabase.from('certificaciones').update({ orden: cert.orden }).eq('id', cert.id)
        )
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const submitData = {
      ...formData,
      url_certificado: normalizeUrl(formData.url_certificado || ""),
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('certificaciones')
          .update(submitData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(certificaciones.map(cert => 
          cert.id === editingId ? { ...cert, ...submitData } as Certificacion : cert
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('certificaciones')
          .insert({
            ...submitData,
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
    } finally {
      setIsLoading(false)
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={certificaciones.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {certificaciones.map((cert) => (
                  <SortableCertificacion
                    key={cert.id}
                    certificacion={cert}
                    onEdit={() => handleEdit(cert)}
                    onDelete={() => handleDelete(cert.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Save Changes" : "Add Certification"}
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
