"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Briefcase, Trash2, GripVertical } from "lucide-react"
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

interface Experiencia {
  id: string
  empresa: string
  cargo: string
  descripcion: string
  sitio_web: string
  fecha_inicio: string
  fecha_fin: string | null
  actualmente_trabajando: boolean
  orden: number
}

interface ExperienciaFormProps {
  experiencias: Experiencia[]
  onChange: (experiencias: Experiencia[]) => void
}

function SortableExperiencia({ 
  experiencia, 
  onEdit, 
  onDelete 
}: { 
  experiencia: Experiencia
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
  } = useSortable({ id: experiencia.id })

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
        <div className="space-y-1">
          <p className="font-medium">{experiencia.cargo}</p>
          <p className="text-sm text-muted-foreground">{experiencia.empresa}</p>
          <p className="text-xs text-muted-foreground">
            {experiencia.fecha_inicio} - {experiencia.actualmente_trabajando ? "Present" : experiencia.fecha_fin}
          </p>
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

export function ExperienciaForm({ experiencias, onChange }: ExperienciaFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Experiencia>>({
    empresa: "",
    cargo: "",
    descripcion: "",
    sitio_web: "",
    fecha_inicio: "",
    fecha_fin: null,
    actualmente_trabajando: false,
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
      const oldIndex = experiencias.findIndex((e) => e.id === active.id)
      const newIndex = experiencias.findIndex((e) => e.id === over.id)
      
      const newOrder = arrayMove(experiencias, oldIndex, newIndex)
      
      const reorderedWithOrder = newOrder.map((exp, index) => ({
        ...exp,
        orden: index,
      }))

      onChange(reorderedWithOrder)

      const supabase = createClient()
      await Promise.all(
        reorderedWithOrder.map((exp) =>
          supabase.from('experiencias').update({ orden: exp.orden }).eq('id', exp.id)
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
      sitio_web: normalizeUrl(formData.sitio_web || ""),
      fecha_fin: formData.actualmente_trabajando ? null : formData.fecha_fin,
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('experiencias')
          .update(submitData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(experiencias.map(exp => 
          exp.id === editingId ? { ...exp, ...submitData } as Experiencia : exp
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('experiencias')
          .insert({
            ...submitData,
            user_id: user.id,
            orden: experiencias.length,
          })
          .select()
        
        if (error) throw error
        
        if (data) {
          onChange([...experiencias, data[0] as Experiencia])
        }
      }
      
      setFormData({
        empresa: "",
        cargo: "",
        descripcion: "",
        sitio_web: "",
        fecha_inicio: "",
        fecha_fin: null,
        actualmente_trabajando: false,
      })
      setIsAdding(false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (exp: Experiencia) => {
    setFormData(exp)
    setEditingId(exp.id || null)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('experiencias').delete().eq('id', id)
      if (error) throw error
      onChange(experiencias.filter(exp => exp.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      empresa: "",
      cargo: "",
      descripcion: "",
      sitio_web: "",
      fecha_inicio: "",
      fecha_fin: null,
      actualmente_trabajando: false,
    })
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Work Experience
        </CardTitle>
        {!isAdding && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {experiencias.length > 0 && !isAdding && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={experiencias.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {experiencias.map((exp) => (
                  <SortableExperiencia
                    key={exp.id}
                    experiencia={exp}
                    onEdit={() => handleEdit(exp)}
                    onDelete={() => handleDelete(exp.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Company</Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  placeholder="Company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Position</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Your role"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Description</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="What did you do?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sitio_web">Company Website</Label>
              <Input
                id="sitio_web"
                type="url"
                value={formData.sitio_web}
                onChange={(e) => setFormData({ ...formData, sitio_web: e.target.value })}
                placeholder="https://company.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Start Date</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_fin">End Date</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin || ""}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  disabled={formData.actualmente_trabajando}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="actualmente_trabajando"
                checked={formData.actualmente_trabajando}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  actualmente_trabajando: checked as boolean,
                  fecha_fin: checked ? null : formData.fecha_fin
                })}
              />
              <Label htmlFor="actualmente_trabajando" className="cursor-pointer text-sm">
                I currently work here
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Save Changes" : "Add Experience"}
              </Button>
            </div>
          </form>
        )}

        {experiencias.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No work experience added yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
