"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Shield, User, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type RoleType = "citizen" | "authority" | "admin"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const message = searchParams.get("message")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Check if user role matches selected role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      if (profile && profile.role !== selectedRole) {
        setError(`This account is registered as a ${profile.role}. Please select the correct role.`)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      router.push(`/${selectedRole}`)
      router.refresh()
    }

    setLoading(false)
  }

  const roleCards = [
    {
      role: "citizen" as RoleType,
      icon: User,
      title: "Citizen",
      description: "Report and track civic issues",
    },
    {
      role: "authority" as RoleType,
      icon: Users,
      title: "Authority",
      description: "Manage assigned issues",
    },
    {
      role: "admin" as RoleType,
      icon: Shield,
      title: "Admin",
      description: "Supervise and manage system",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Civic Connect</h1>
          <p className="text-muted-foreground">Smart Civic Issue Reporting System</p>
        </div>

        {message && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {!selectedRole ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Select Your Role</h2>
            <div className="grid gap-4">
              {roleCards.map((item) => (
                <Card
                  key={item.role}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedRole(item.role)}
                >
                  <CardHeader className="flex flex-row items-center gap-4 p-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} className="p-0 h-auto">
                  Back
                </Button>
              </div>
              <CardTitle>Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href={`/auth/signup?role=${selectedRole}`} className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
