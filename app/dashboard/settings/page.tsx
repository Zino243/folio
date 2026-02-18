"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check } from "lucide-react"

interface Profile {
  id: string
  email: string
  full_name: string
  plan: string
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "forever",
    description: "Perfect for getting started",
    features: [
      "1 Portfolio",
      "Unlimited Projects",
      "Basic Analytics",
      "Community Support",
    ],
    notIncluded: [
      "Custom Domain",
      "Remove Folio Branding",
      "Priority Support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    priceNote: "/month",
    description: "For serious developers",
    features: [
      "5 Portfolios",
      "Unlimited Projects",
      "Advanced Analytics",
      "Custom Domain",
      "Remove Folio Branding",
      "Priority Support",
    ],
    popular: true,
  },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
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

  const handleChangePlan = async (planId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ plan: planId })
      .eq('id', user.id)

    setProfile({ ...profile!, plan: planId })
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
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

      {/* Plan */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Plan</CardTitle>
              <CardDescription>Your current subscription plan.</CardDescription>
            </div>
            <Badge 
              variant={profile?.plan === "pro" ? "default" : "secondary"} 
              className="uppercase"
            >
              {profile?.plan || "free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 p-4 ${
                profile?.plan === plan.id 
                  ? "border-primary" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.priceNote && (
                    <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.notIncluded?.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4">×</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                {profile?.plan === plan.id ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleChangePlan(plan.id)} 
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.id === "pro" ? "Upgrade" : "Downgrade"} to {plan.name}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
