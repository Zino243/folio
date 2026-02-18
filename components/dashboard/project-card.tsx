"use client"

import type { Project } from "@/lib/mock-data"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Pencil, Trash2, Star } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProjectCardProps {
  project: Project | any
  portfolioId: string
  onUpdate?: () => void
}

export function ProjectCard({ project, portfolioId, onUpdate }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
      
      if (error) throw error
      
      onUpdate?.()
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <Card className="overflow-hidden border-border transition-all hover:border-foreground/20 hover:shadow-sm">
      {/* Cover image placeholder */}
      <div className="relative h-40 bg-secondary">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-muted-foreground/20">{project.title.charAt(0)}</span>
        </div>
        {project.featured && (
          <div className="absolute right-3 top-3">
            <Badge className="gap-1 bg-foreground text-primary-foreground">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5">
        <h3 className="font-semibold text-foreground">{project.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {project.description.split("\n")[0]}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {(project.technologies as string[])?.slice(0, 4).map((tech: string) => (
            <Badge key={tech} variant="secondary" className="text-[10px]">
              {tech}
            </Badge>
          ))}
          {(project.technologies as string[])?.length > 4 && (
            <Badge variant="secondary" className="text-[10px]">
              +{(project.technologies as string[]).length - 4}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link href={`/dashboard/portfolios/${portfolioId}/projects/${project.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project "{project.title}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
