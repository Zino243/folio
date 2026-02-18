"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Portfolio } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ExternalLink, Pencil, Trash2, FolderOpen } from "lucide-react"

interface PortfolioCardProps {
  portfolio: Portfolio | any
  onUpdate?: () => void
}

export function PortfolioCard({ portfolio, onUpdate }: PortfolioCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolio.id)
      
      if (error) throw error
      
      onUpdate?.()
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting portfolio:', error)
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <Card className="border-border transition-all hover:border-foreground/20 hover:shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-primary-foreground">
              {portfolio.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{portfolio.name}</h3>
              <p className="text-xs text-muted-foreground">/{portfolio.username}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            <FolderOpen className="mr-1 h-3 w-3" />
            {portfolio.projectCount} projects
          </Badge>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {portfolio.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/dashboard/portfolios/${portfolio.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Link href={`/${portfolio.username}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Button>
          </Link>
          <Link href={`/dashboard/portfolios/${portfolio.id}/projects`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Projects
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
                  This will permanently delete the portfolio "{portfolio.name}" and all associated projects. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Portfolio
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
