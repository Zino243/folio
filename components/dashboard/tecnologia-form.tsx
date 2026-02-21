"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Code, Trash2, GripVertical } from "lucide-react"
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Tecnologia {
  id: string
  nombre: string
  categoria: string
  nivel: string
  anos_experiencia: number | null
  imagen_url: string
  orden: number
}

const CATEGORIAS = [
  "Frontend",
  "Backend", 
  "Database",
  "DevOps",
  "Mobile",
  "Design",
  "Tools",
  "Software",
  "Techniques",
  "Other"
]

const NIVELES = ["básico", "intermedio", "avanzado", "profesional", "experto"]

interface TecnologiaFormProps {
  tecnologias: Tecnologia[]
  onChange: (tecnologias: Tecnologia[]) => void
}

function SortableTechBadge({ 
  tech, 
  onEdit, 
  onDelete 
}: { 
  tech: Tecnologia
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
  } = useSortable({ id: tech.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>
      <Badge variant="secondary" className="gap-2 py-2 pr-1">
        {tech.imagen_url && (
          <img src={tech.imagen_url} alt={tech.nombre} className="h-4 w-4 object-contain" />
        )}
        <span>{tech.nombre}</span>
        {tech.anos_experiencia && (
          <span className="text-xs text-muted-foreground">
            {tech.anos_experiencia}y
          </span>
        )}
        <div className="flex gap-1 ml-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="rounded hover:bg-muted px-1 text-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded hover:bg-muted px-1 text-xs text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </Badge>
    </div>
  )
}

export function TecnologiaForm({ tecnologias, onChange }: TecnologiaFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Tecnologia>>({
    nombre: "",
    categoria: "",
    nivel: "",
    anos_experiencia: null,
    imagen_url: "",
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
      const oldIndex = tecnologias.findIndex((t) => t.id === active.id)
      const newIndex = tecnologias.findIndex((t) => t.id === over.id)
      
      const newOrder = arrayMove(tecnologias, oldIndex, newIndex)
      
      const reorderedWithOrder = newOrder.map((tech, index) => ({
        ...tech,
        orden: index,
      }))

      onChange(reorderedWithOrder)

      const supabase = createClient()
      await Promise.all(
        reorderedWithOrder.map((tech) =>
          supabase.from('tecnologias').update({ orden: tech.orden }).eq('id', tech.id)
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

    try {
      if (editingId) {
        const { error } = await supabase
          .from('tecnologias')
          .update(formData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(tecnologias.map(tech => 
          tech.id === editingId ? { ...tech, ...formData } as Tecnologia : tech
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('tecnologias')
          .insert({
            ...formData,
            user_id: user.id,
            orden: tecnologias.length,
          })
          .select()
        
        if (error) throw error
        
        if (data) {
          onChange([...tecnologias, data[0] as Tecnologia])
        }
      }
      
      setFormData({
        nombre: "",
        categoria: "",
        nivel: "",
        anos_experiencia: null,
        imagen_url: "",
      })
      setIsAdding(false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (tech: Tecnologia) => {
    setFormData(tech)
    setEditingId(tech.id || null)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('tecnologias').delete().eq('id', id)
      if (error) throw error
      onChange(tecnologias.filter(tech => tech.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      nombre: "",
      categoria: "",
      nivel: "",
      anos_experiencia: null,
      imagen_url: "",
    })
  }

  const groupedTecnologias = tecnologias.reduce((acc, tech) => {
    const cat = tech.categoria || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tech)
    return acc
  }, {} as Record<string, Tecnologia[]>)

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Code className="h-4 w-4" />
          Technologies
        </CardTitle>
        {!isAdding && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(groupedTecnologias).length > 0 && !isAdding && (
          <div className="space-y-4">
            {Object.entries(groupedTecnologias).map(([categoria, techs]) => (
              <div key={categoria}>
                <p className="text-sm font-medium text-muted-foreground mb-2">{categoria}</p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={techs.map(t => t.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="flex flex-wrap gap-2">
                      {techs.map((tech) => (
                        <SortableTechBadge
                          key={tech.id}
                          tech={tech}
                          onEdit={() => handleEdit(tech)}
                          onDelete={() => handleDelete(tech.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ))}
          </div>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Technology Name</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="React, Python, PostgreSQL..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Category</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Frontend, Backend, Mobile..."
                  list="categorias-suggestions"
                />
                <datalist id="categorias-suggestions">
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nivel">Level (optional)</Label>
                <Input
                  id="nivel"
                  value={formData.nivel || ""}
                  onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                  placeholder="Intermediate, Advanced, 2D, 3D..."
                  list="nivel-suggestions"
                />
                <datalist id="nivel-suggestions">
                  {NIVELES.map((nivel) => (
                    <option key={nivel} value={nivel} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="anos_experiencia">Years of Experience</Label>
                <Input
                  id="anos_experiencia"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.anos_experiencia || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    anos_experiencia: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  placeholder="2.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon (optional)</Label>
              <ImageUpload
                bucket="portfolio-images"
                folder="technologies"
                value={formData.imagen_url}
                onChange={(url) => setFormData({ ...formData, imagen_url: url })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Save Changes" : "Add Technology"}
              </Button>
            </div>
          </form>
        )}

        {tecnologias.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No technologies added yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
