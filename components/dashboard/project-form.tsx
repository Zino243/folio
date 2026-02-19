"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Project } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { ImageUpload } from "./image-upload"

interface ProjectFormProps {
  portfolioId: string
  project?: Project
}

export function ProjectForm({ portfolioId, project }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies || [])
  const [techInput, setTechInput] = useState("")
  const [coverImage, setCoverImage] = useState(project?.cover_image || "")
  const [galleryImages, setGalleryImages] = useState<string[]>(project?.images || [])
  const supabase = createClient()

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && techInput.trim()) {
      e.preventDefault()
      if (!technologies.includes(techInput.trim())) {
        setTechnologies([...technologies, techInput.trim()])
      }
      setTechInput("")
    }
  }

  const removeTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const images = galleryImages.filter(img => img.trim())
    
    const projectUrl = formData.get('project-url') as string
    const demoUrl = formData.get('demo-url') as string
    const githubUrl = formData.get('github-url') as string
    
    const normalizeUrl = (url: string) => {
      if (!url) return null
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return 'https://' + url
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!project?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('projects_limit')
          .eq('id', user.id)
          .single()

        if (profile) {
          const { count } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (count !== null && count >= profile.projects_limit) {
            throw new Error(`Has alcanzado el límite de ${profile.projects_limit} proyectos. Compra un pack para crear más.`)
          }
        }
      }

      const projectData = {
        portfolio_id: portfolioId,
        user_id: user.id,
        title: formData.get('title') as string || '',
        slug: (formData.get('title') as string || '').toLowerCase().replace(/\s+/g, '-'),
        description: formData.get('description') as string || '',
        project_url: normalizeUrl(projectUrl),
        demo_url: normalizeUrl(demoUrl),
        github_url: normalizeUrl(githubUrl),
        project_date: formData.get('date') as string || null,
        featured: formData.get('featured') === 'on',
        technologies,
        images,
        cover_image: coverImage || images[0] || null,
      }

      if (project?.id) {
        console.log('Updating project with data:', projectData)
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id)
        if (error) {
          console.error('Update error:', error)
          throw error
        }
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(projectData)
        if (error) throw error
      }

      router.push(`/dashboard/portfolios/${portfolioId}/projects`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="My Awesome Project"
              defaultValue={project?.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your project in detail..."
              defaultValue={project?.description}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={project?.project_date}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              name="featured"
              defaultChecked={project?.featured}
            />
            <Label htmlFor="featured" className="cursor-pointer text-sm">
              Mark as Featured
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tech">Add Technologies</Label>
            <Input
              id="tech"
              placeholder="Type and press Enter..."
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleAddTech}
            />
          </div>
          {technologies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTech(tech)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    aria-label={`Remove ${tech}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Links */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-url">Project Website</Label>
            <Input
              id="project-url"
              name="project-url"
              placeholder="https://theactualproject.com"
              defaultValue={project?.project_url || ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-url">Demo URL</Label>
            <Input
              id="demo-url"
              name="demo-url"
              placeholder="https://myproject.com/demo"
              defaultValue={project?.demo_url || ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github-url">GitHub URL</Label>
            <Input
              id="github-url"
              name="github-url"
              placeholder="https://github.com/user/repo"
              defaultValue={project?.github_url || ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cover Image */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Cover Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            bucket="portfolio-images"
            folder={`projects/${portfolioId}`}
            value={coverImage}
            onChange={setCoverImage}
          />
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Image Gallery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {galleryImages.map((img, index) => (
            <div key={index} className="space-y-2">
              <ImageUpload
                bucket="portfolio-images"
                folder={`projects/${portfolioId}`}
                value={img}
                onChange={(url) => {
                  const newImages = [...galleryImages]
                  newImages[index] = url
                  setGalleryImages(newImages)
                }}
              />
              {galleryImages.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setGalleryImages([...galleryImages, ""])}
          >
            Add Image
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/portfolios/${portfolioId}/projects`)}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : project ? "Save Changes" : "Add Project"}
        </Button>
      </div>
    </form>
    </>
  )
}
