"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, FileText, Trash2, GripVertical } from "lucide-react"
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

interface Post {
  id: string
  titulo: string
  contenido: string
  slug: string
  excerpt: string
  tags: string[]
  reading_time: number
  imagen_destacada: string
  estado: string
  published_at: string | null
}

interface PostFormProps {
  posts: Post[]
  onChange: (posts: Post[]) => void
  blogLimit?: number
}

function SortablePost({ 
  post, 
  onEdit, 
  onDelete 
}: { 
  post: Post
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
  } = useSortable({ id: post.id })

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
          <p className="font-medium">{post.titulo}</p>
          <p className="text-xs text-muted-foreground">/{post.slug}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={post.estado === 'publicado' ? 'default' : 'secondary'}>
              {post.estado}
            </Badge>
            {post.tags && post.tags.length > 0 && post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
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

export function PostForm({ posts, onChange, blogLimit = 0 }: PostFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Post>>({
    titulo: "",
    contenido: "",
    slug: "",
    excerpt: "",
    tags: [],
    reading_time: 5,
    imagen_destacada: "",
    estado: "borrador",
  })
  const [tagInput, setTagInput] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(words / wordsPerMinute))
  }

  const handleTitleChange = (title: string) => {
    setFormData({ 
      ...formData, 
      titulo: title,
      slug: editingId ? formData.slug : generateSlug(title)
    })
  }

  const handleContentChange = (content: string) => {
    setFormData({ 
      ...formData, 
      contenido: content,
      reading_time: calculateReadingTime(content)
    })
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = posts.findIndex((p) => p.id === active.id)
      const newIndex = posts.findIndex((p) => p.id === over.id)
      
      const newOrder = arrayMove(posts, oldIndex, newIndex)
      
      onChange(newOrder)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!editingId && posts.length >= blogLimit) {
      setIsLoading(false)
      if (blogLimit === 0) {
        setError("No tienes un pack de blog comprado. Compra uno para crear posts.")
      } else {
        setError(`Has alcanzado el límite de ${blogLimit} posts. Compra un pack para crear más.`)
      }
      return
    }

    try {
      const postData = {
        titulo: formData.titulo,
        slug: formData.slug,
        contenido: formData.contenido,
        excerpt: formData.excerpt,
        tags: formData.tags,
        reading_time: formData.reading_time,
        imagen_destacada: formData.imagen_destacada,
        estado: formData.estado,
        published_at: formData.estado === 'publicado' ? new Date().toISOString() : null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingId)
        
        if (error) throw error
        
        onChange(posts.map(post => 
          post.id === editingId ? { ...post, ...postData } as Post : post
        ))
        setEditingId(null)
      } else {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            ...postData,
            user_id: user.id,
          })
          .select()
        
        if (error) throw error
        
        if (data) {
          onChange([...posts, data[0] as Post])
        }
      }
      
      setFormData({
        titulo: "",
        contenido: "",
        slug: "",
        excerpt: "",
        tags: [],
        reading_time: 5,
        imagen_destacada: "",
        estado: "borrador",
      })
      setIsAdding(false)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (post: Post) => {
    setFormData(post)
    setEditingId(post.id || null)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
      onChange(posts.filter(post => post.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  const cancelEdit = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      titulo: "",
      contenido: "",
      slug: "",
      excerpt: "",
      tags: [],
      reading_time: 5,
      imagen_destacada: "",
      estado: "borrador",
    })
  }

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Blog Posts
          {blogLimit > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({posts.length}/{blogLimit})
            </span>
          )}
        </CardTitle>
        {!isAdding && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (posts.length >= blogLimit) {
                if (blogLimit === 0) {
                  setError("No tienes un pack de blog comprado. Compra uno para crear posts.")
                } else {
                  setError(`Has alcanzado el límite de ${blogLimit} posts. Compra un pack para crear más.`)
                }
              } else {
                setIsAdding(true)
              }
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {posts.length > 0 && !isAdding && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={posts.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {posts.map((post) => (
                  <SortablePost
                    key={post.id}
                    post={post}
                    onEdit={() => handleEdit(post)}
                    onDelete={() => handleDelete(post.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Title</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="My Blog Post"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="my-blog-post"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt / Summary</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt || ""}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="A short summary of the post..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag..."
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>Add</Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenido">Content (Markdown supported)</Label>
              <p className="text-xs text-muted-foreground">
                Supports: bold, italic, # headings, - lists, links, code, code blocks, and more!
              </p>
              <Textarea
                id="contenido"
                value={formData.contenido}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={"# My Post\n\nWrite your content using **Markdown**!\n\n## Features\n- Feature 1\n- Feature 2\n\n`code example`"}
                rows={15}
                required
              />
              <p className="text-xs text-muted-foreground">
                Estimated reading time: {formData.reading_time || 1} min
              </p>
            </div>

            <div className="space-y-2">
              <Label>Featured Image</Label>
              <ImageUpload
                bucket="portfolio-images"
                folder="posts"
                value={formData.imagen_destacada || ""}
                onChange={(url) => setFormData({ ...formData, imagen_destacada: url })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Status</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Draft</SelectItem>
                  <SelectItem value="publicado">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingId ? "Save Changes" : "Add Post"}
              </Button>
            </div>
          </form>
        )}

        {posts.length === 0 && !isAdding && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No blog posts added yet
          </p>
        )}
      </CardContent>
    </Card>
  )
}
