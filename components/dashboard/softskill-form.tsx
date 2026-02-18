"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Users, Trash2 } from "lucide-react"

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

export function SoftSkillForm({ softSkills, onChange }: SoftSkillFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<SoftSkill>>({
    nombre: "",
    descripcion: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <div 
                key={skill.id} 
                className="group flex items-center gap-2 rounded-full border px-4 py-2"
              >
                <span className="text-sm font-medium">{skill.nombre}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(skill)}
                    className="text-xs hover:text-primary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(skill.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Add Skill"}
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
