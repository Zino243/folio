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
import { X, Plus, Briefcase, Trash2 } from "lucide-react"

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

export function ExperienciaForm({ experiencias, onChange }: ExperienciaFormProps) {
  const [isAdding, setIsAdding] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (editingId) {
        const { error } = await supabase
          .from('experiencias')
          .update({
            ...formData,
            fecha_fin: formData.actualmente_trabajando ? null : formData.fecha_fin,
          })
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(experiencias.map(exp => 
          exp.id === editingId ? { ...exp, ...formData } as Experiencia : exp
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('experiencias')
          .insert({
            ...formData,
            user_id: user.id,
            fecha_fin: formData.actualmente_trabajando ? null : formData.fecha_fin,
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
          <div className="space-y-3">
            {experiencias.map((exp) => (
              <div key={exp.id} className="flex items-start justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium">{exp.cargo}</p>
                  <p className="text-sm text-muted-foreground">{exp.empresa}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.fecha_inicio} - {exp.actualmente_trabajando ? "Present" : exp.fecha_fin}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleEdit(exp)}>
                    <span className="text-xs">Edit</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(exp.id!)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Add Experience"}
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
