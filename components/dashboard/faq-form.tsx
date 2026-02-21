"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, HelpCircle, Trash2, GripVertical } from "lucide-react"
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

interface FAQ {
  id: string
  pregunta: string
  respuesta: string
  orden: number
}

interface FAQFormProps {
  faqs: FAQ[]
  onChange: (faqs: FAQ[]) => void
}

function SortableFAQ({ 
  faq, 
  onEdit, 
  onDelete 
}: { 
  faq: FAQ
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
  } = useSortable({ id: faq.id })

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
          <p className="font-medium text-sm">{faq.pregunta}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{faq.respuesta}</p>
        </div>
        <div className="flex gap-1 ml-2">
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

export function FAQForm({ faqs, onChange }: FAQFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<FAQ>>({
    pregunta: "",
    respuesta: "",
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
      const oldIndex = faqs.findIndex((f) => f.id === active.id)
      const newIndex = faqs.findIndex((f) => f.id === over.id)
      
      const newOrder = arrayMove(faqs, oldIndex, newIndex)
      
      const reorderedWithOrder = newOrder.map((faq, index) => ({
        ...faq,
        orden: index,
      }))

      onChange(reorderedWithOrder)

      const supabase = createClient()
      await Promise.all(
        reorderedWithOrder.map((faq) =>
          supabase.from('faqs').update({ orden: faq.orden }).eq('id', faq.id)
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
          .from('faqs')
          .update(formData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(faqs.map(faq => 
          faq.id === editingId ? { ...faq, ...formData } as FAQ : faq
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('faqs')
          .insert({
            ...formData,
            user_id: user.id,
            orden: faqs.length,
          })
          .select()
        
        if (error) throw error
        
        if (data) {
          onChange([...faqs, data[0] as FAQ])
        }
      }
      
      setFormData({
        pregunta: "",
        respuesta: "",
      })
      setIsAdding(false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setFormData(faq)
    setEditingId(faq.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id)
      if (error) throw error
      onChange(faqs.filter(faq => faq.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      pregunta: "",
      respuesta: "",
    })
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          FAQ / Frequently Asked Questions
        </CardTitle>
        {!isAdding && (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {faqs.length > 0 && !isAdding && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={faqs.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <SortableFAQ
                    key={faq.id}
                    faq={faq}
                    onEdit={() => handleEdit(faq)}
                    onDelete={() => handleDelete(faq.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pregunta">Question</Label>
              <Input
                id="pregunta"
                value={formData.pregunta}
                onChange={(e) => setFormData({ ...formData, pregunta: e.target.value })}
                placeholder="How can I contact you?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respuesta">Answer</Label>
              <Textarea
                id="respuesta"
                value={formData.respuesta}
                onChange={(e) => setFormData({ ...formData, respuesta: e.target.value })}
                placeholder="You can contact me via email..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Save Changes" : "Add FAQ"}
              </Button>
            </div>
          </form>
        )}

        {faqs.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No FAQs added yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
