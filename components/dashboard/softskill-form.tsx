"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Users, Trash2, GripVertical } from "lucide-react"
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

interface SoftSkill {
  id: string
  nombre: string
  descripcion: string
  orden: number
}

interface SoftSkillFormProps {
  softSkills: SoftSkill[]
  onChange: (softSkills: SoftSkill[]) => void
}

function SortableSkill({ 
  skill, 
  onEdit, 
  onDelete 
}: { 
  skill: SoftSkill
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
  } = useSortable({ id: skill.id })

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
        className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-l-md border-r-0 rounded-r-none"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </button>
      <div className="group flex items-center gap-2 rounded-full border px-4 py-2 rounded-l-none">
        <span className="text-sm font-medium">{skill.nombre}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-xs hover:text-primary"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-xs text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function SoftSkillForm({ softSkills, onChange }: SoftSkillFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<SoftSkill>>({
    nombre: "",
    descripcion: "",
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
      const oldIndex = softSkills.findIndex((s) => s.id === active.id)
      const newIndex = softSkills.findIndex((s) => s.id === over.id)
      
      const newOrder = arrayMove(softSkills, oldIndex, newIndex)
      
      const reorderedWithOrder = newOrder.map((skill, index) => ({
        ...skill,
        orden: index,
      }))

      onChange(reorderedWithOrder)

      const supabase = createClient()
      await Promise.all(
        reorderedWithOrder.map((skill) =>
          supabase.from('soft_skills').update({ orden: skill.orden }).eq('id', skill.id)
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
          .from('soft_skills')
          .update(formData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(softSkills.map(skill => 
          skill.id === editingId ? { ...skill, ...formData } as SoftSkill : skill
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('soft_skills')
          .insert({
            ...formData,
            user_id: user.id,
            orden: softSkills.length,
          })
          .select()
        
        if (error) throw error
        
        if (data) {
          onChange([...softSkills, data[0] as SoftSkill])
        }
      }
      
      setFormData({
        nombre: "",
        descripcion: "",
      })
      setIsAdding(false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (skill: SoftSkill) => {
    setFormData(skill)
    setEditingId(skill.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('soft_skills').delete().eq('id', id)
      if (error) throw error
      onChange(softSkills.filter(skill => skill.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      nombre: "",
      descripcion: "",
    })
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Soft Skills
        </CardTitle>
        {!isAdding && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {softSkills.length > 0 && !isAdding && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={softSkills.map(s => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill) => (
                  <SortableSkill
                    key={skill.id}
                    skill={skill}
                    onEdit={() => handleEdit(skill)}
                    onDelete={() => handleDelete(skill.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Skill Name</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Leadership, Communication, Teamwork..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Description (optional)</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion || ""}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Brief description of this skill..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Save Changes" : "Add Skill"}
              </Button>
            </div>
          </form>
        )}

        {softSkills.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No soft skills added yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
