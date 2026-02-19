"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Portfolio } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageUpload } from "./image-upload"

interface PortfolioFormProps {
  portfolio?: Portfolio | any
}

export function PortfolioForm({ portfolio }: PortfolioFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState(portfolio?.profile_image || "")
  const [bannerImage, setBannerImage] = useState(portfolio?.banner_image || "")
  const [primaryColor, setPrimaryColor] = useState(portfolio?.primary_color || "#000000")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (!portfolio?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('portfolios_limit')
          .eq('id', user.id)
          .single()

        if (profile) {
          const { count } = await supabase
            .from('portfolios')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          if (count !== null && count >= profile.portfolios_limit) {
            throw new Error(`Has alcanzado el límite de ${profile.portfolios_limit} portfolios. Compra un pack para crear más.`)
          }
        }
      }

      const portfolioData = {
        user_id: user.id,
        name: formData.get('name') as string,
        username: formData.get('username') as string,
        title: formData.get('title') as string || null,
        description: formData.get('description') as string,
        profile_image: profileImage,
        banner_image: bannerImage,
        primary_color: primaryColor,
        contact_email: formData.get('contact-email') as string || null,
        contact_show: formData.get('contact-show') === 'on',
        theme: formData.get('theme') || 'system',
        seo_title: formData.get('seo-title') as string,
        seo_description: formData.get('seo-description') as string,
        social_twitter: formData.get('twitter') as string,
        social_github: formData.get('github') as string,
        social_linkedin: formData.get('linkedin') as string,
        social_website: formData.get('website') as string,
      }

      if (portfolio?.id) {
        const { error } = await supabase
          .from('portfolios')
          .update(portfolioData)
          .eq('id', portfolio.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('portfolios')
          .insert(portfolioData)
        if (error) throw error
      }

      router.push("/dashboard/portfolios")
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
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portfolio Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Portfolio"
              defaultValue={portfolio?.name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">portlify.app/</span>
              <Input
                id="username"
                name="username"
                placeholder="alexrivera"
                defaultValue={portfolio?.username}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title / Tagline (optional)</Label>
            <Input
              id="title"
              name="title"
              placeholder="Full Stack Developer | React Expert"
              defaultValue={portfolio?.title}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell visitors about yourself..."
              defaultValue={portfolio?.description}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <ImageUpload
              bucket="avatars"
              value={profileImage}
              onChange={setProfileImage}
            />
          </div>
          <div className="space-y-2">
            <Label>Banner Image</Label>
            <ImageUpload
              bucket="portfolio-images"
              folder="banners"
              value={bannerImage}
              onChange={setBannerImage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              name="twitter"
              placeholder="https://twitter.com/username"
              defaultValue={portfolio?.social_twitter}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              name="github"
              placeholder="https://github.com/username"
              defaultValue={portfolio?.social_github}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              name="linkedin"
              placeholder="https://linkedin.com/in/username"
              defaultValue={portfolio?.social_linkedin}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              placeholder="https://yoursite.com"
              defaultValue={portfolio?.social_website}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input
              id="contact-email"
              name="contact-email"
              type="email"
              placeholder="you@example.com"
              defaultValue={portfolio?.contact_email}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="contact-show"
              name="contact-show"
              defaultChecked={portfolio?.contact_show !== false}
            />
            <Label htmlFor="contact-show" className="cursor-pointer text-sm">
              Show contact section on portfolio
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Appearance & SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary-color"
                name="primary-color"
                type="color"
                className="h-10 w-14 cursor-pointer p-1"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <Input
                placeholder="#000000"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              name="theme"
              defaultValue={portfolio?.theme || 'system'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              name="seo-title"
              placeholder="Your Name | Developer Portfolio"
              defaultValue={portfolio?.seo_title}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seo-description">SEO Description</Label>
            <Textarea
              id="seo-description"
              name="seo-description"
              placeholder="A brief description for search engines..."
              defaultValue={portfolio?.seo_description}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/portfolios")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : portfolio ? "Save Changes" : "Create Portfolio"}
        </Button>
      </div>
    </form>
    </>
  )
}
