'use client'

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { mockSupabase } from "@/lib/local-db"
import { AppHeader } from "@/components/app-header"
import type { Profile, Notification } from "@/lib/types"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await mockSupabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await mockSupabase.from("profiles").select("*").eq("id", user.id).single()
      
      if (!profileData || profileData.role !== "admin") {
        router.push("/auth/login")
        return
      }

      const { data: notificationsData } = await mockSupabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then((res: any) => res)

      setProfile(profileData as Profile)
      setNotifications(notificationsData as Notification[])
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) return null

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={profile as Profile} notifications={(notifications || []) as Notification[]} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
