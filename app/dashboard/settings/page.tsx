"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Package, FolderKanban, FileText, Loader2 } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string
  plan: string
  portfolios_limit: number
  projects_limit: number
  blog_posts_limit: number
}

interface Purchase {
  id: string
  product_type: string
  amount_eur: number
  credits_added: number
  created_at: string
  status: string
}

const PACKS = [
  {
    id: "portfolio_pack",
    name: "Pack Portfolio",
    description: "1 Portfolio + 3 Proyectos",
    price: "9.99€",
    icon: FolderKanban,
    features: [
      "1 Portfolio adicional",
      "3 Proyectos adicionales",
    ],
  },
  {
    id: "projects_pack",
    name: "Pack Proyectos",
    description: "5 Proyectos adicionales",
    price: "4.99€",
    icon: Package,
    features: [
      "5 Proyectos adicionales",
    ],
  },
  {
    id: "blog_pack",
    name: "Pack Blog",
    description: "5 Posts de blog",
    price: "4.99€",
    icon: FileText,
    features: [
      "5 Posts de blog adicionales",
    ],
  },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [buying, setBuying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setName(data.full_name || "")
      }

      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (purchasesData) {
        setPurchases(purchasesData)
      }

      setLoading(false)
    }

    loadProfile()
  }, [supabase])

  const handleSaveName = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', user.id)

    setSaving(false)
  }

  const handleBuyPack = async (packId: string) => {
    setBuying(packId)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productType: packId }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Error al procesar el pago')
      }
    } catch (err) {
      setError('Error al procesar el pago')
    } finally {
      setBuying(null)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  const currentUsage = profile ? {
    portfolios: profile.portfolios_limit,
    projects: profile.projects_limit,
    blogPosts: profile.blog_posts_limit,
  } : null

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input 
              id="settings-name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email">Email</Label>
            <Input 
              id="settings-email" 
              type="email" 
              value={profile?.email || ""} 
              disabled 
            />
          </div>
          <Button onClick={handleSaveName} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Current Usage */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Tu Plan</CardTitle>
          <CardDescription>Límites actuales de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Portfolios</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{currentUsage?.portfolios}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Proyectos</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{currentUsage?.projects}</p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Posts Blog</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{currentUsage?.blogPosts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packs */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Comprar Packs</CardTitle>
          <CardDescription>
            Amplía tu plan comprand packs adicionales. Sin suscripción mensual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {PACKS.map((pack) => {
              const Icon = pack.icon
              return (
                <div
                  key={pack.id}
                  className="relative rounded-lg border-2 border-border p-4 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{pack.name}</h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{pack.description}</p>
                  <div className="mt-4 space-y-2">
                    {pack.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={() => handleBuyPack(pack.id)} 
                      disabled={buying === pack.id}
                      className="w-full"
                      variant="default"
                    >
                      {buying === pack.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        pack.price
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Purchase History */}
      {purchases.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Historial de Compras</CardTitle>
            <CardDescription>Tus compras anteriores.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {purchase.product_type === 'portfolio_pack' && 'Pack Portfolio'}
                      {purchase.product_type === 'projects_pack' && 'Pack Proyectos'}
                      {purchase.product_type === 'blog_pack' && 'Pack Blog'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(purchase.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(purchase.amount_eur / 100).toFixed(2)}€</p>
                    <Badge variant="secondary" className="text-xs">
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
