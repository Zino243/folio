"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, GraduationCap, Trash2, GripVertical } from "lucide-react"
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

interface Estudio {
  id: string
  institucion: string
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string | null
  actualmente_estudiando: boolean
  orden: number
}

interface EstudioFormProps {
  estudios: Estudio[]
  onChange: (estudios: Estudio[]) => void
}

function SortableEstudio({ 
  estudio, 
  onEdit, 
  onDelete 
}: { 
  estudio: Estudio
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
  } = useSortable({ id: estudio.id })

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
          <p className="font-medium">{estudio.titulo}</p>
          <p className="text-sm text-muted-foreground">{estudio.institucion}</p>
          <p className="text-xs text-muted-foreground">
            {estudio.fecha_inicio} - {estudio.actualmente_estudiando ? "Present" : estudio.fecha_fin}
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

export function EstudioForm({ estudios, onChange }: EstudioFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Estudio>>({
    institucion: "",
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: null,
    actualmente_estudiando: false,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = estudios.findIndex((e) => e.id === active.id)
      const newIndex = estudios.findIndex((e) => e.id === over.id)
      
      const newOrder = arrayMove(estudios, oldIndex, newIndex)
      
      const reorderedWithOrder = newOrder.map((est, index) => ({
        ...est,
        orden: index,
      }))

      onChange(reorderedWithOrder)

      const supabase = createClient()
      await Promise.all(
        reorderedWithOrder.map((est) =>
          supabase.from('estudios').update({ orden: est.orden }).eq('id', est.id)
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
      fecha_fin: formData.actualmente_estudiando ? null : formData.fecha_fin,
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('estudios')
          .update(submitData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(estudios.map(est => 
          est.id === editingId ? { ...est, ...submitData } as Estudio : est
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('estudios')
          .insert({
            ...submitData,
            user_id: user.id,
            orden: estudios.length,
          })
          .select()
        
        if (error) throw error
        
        if (data) {
          onChange([...estudios, data[0] as Estudio])
        }
      }
      
      setFormData({
        institucion: "",
        titulo: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: null,
        actualmente_estudiando: false,
      })
      setIsAdding(false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (est: Estudio) => {
    setFormData(est)
    setEditingId(est.id || null)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('estudios').delete().eq('id', id)
      if (error) throw error
      onChange(estudios.filter(est => est.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      institucion: "",
      titulo: "",
      descripcion: "",
      fecha_inicio: "",
      fecha_fin: null,
      actualmente_estudiando: false,
    })
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Education
        </CardTitle>
        {!isAdding && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {estudios.length > 0 && !isAdding && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={estudios.map(e => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {estudios.map((est) => (
                  <SortableEstudio
                    key={est.id}
                    estudio={est}
                    onEdit={() => handleEdit(est)}
                    onDelete={() => handleDelete(est.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institucion">Institution</Label>
              <Input
                id="institucion"
                value={formData.institucion}
                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                placeholder="University or school name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Degree / Title</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Computer Science, Bachelor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Description</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="What did you study?"
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
                  disabled={formData.actualmente_estudiando}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="actualmente_estudiando"
                checked={formData.actualmente_estudiando}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  actualmente_estudiando: checked as boolean,
                  fecha_fin: checked ? null : formData.fecha_fin
                })}
              />
              <Label htmlFor="actualmente_estudiando" className="cursor-pointer text-sm">
                I currently study here
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Save Changes" : "Add Education"}
              </Button>
            </div>
          </form>
        )}

        {estudios.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No education added yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
