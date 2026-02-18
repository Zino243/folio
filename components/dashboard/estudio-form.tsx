"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, GraduationCap, Trash2 } from "lucide-react"

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

export function EstudioForm({ estudios, onChange }: EstudioFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Estudio>>({
    institucion: "",
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: null,
    actualmente_estudiando: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (editingId) {
        const { error } = await supabase
          .from('estudios')
          .update({
            ...formData,
            fecha_fin: formData.actualmente_estudiando ? null : formData.fecha_fin,
          })
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(estudios.map(est => 
          est.id === editingId ? { ...est, ...formData } as Estudio : est
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('estudios')
          .insert({
            ...formData,
            user_id: user.id,
            fecha_fin: formData.actualmente_estudiando ? null : formData.fecha_fin,
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
          <div className="space-y-3">
            {estudios.map((est) => (
              <div key={est.id} className="flex items-start justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium">{est.titulo}</p>
                  <p className="text-sm text-muted-foreground">{est.institucion}</p>
                  <p className="text-xs text-muted-foreground">
                    {est.fecha_inicio} - {est.actualmente_estudiando ? "Present" : est.fecha_fin}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleEdit(est)}>
                    <span className="text-xs">Edit</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleDelete(est.id!)}>
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
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="What did you study?"
                rows={3}
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
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Add Education"}
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
