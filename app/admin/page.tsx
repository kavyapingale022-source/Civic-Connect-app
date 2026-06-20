'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { mockSupabase } from "@/lib/local-db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { IssueCard } from "@/components/issue-card"
import type { Issue } from "@/lib/types"

export default function AdminDashboard() {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
  const [allIssues, setAllIssues] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await mockSupabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: issuesData } = await mockSupabase
        .from("issues")
        .select("*, citizen:profiles!issues_citizen_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(6)
        .then((res: any) => res)

      const { data: allIssuesData } = await mockSupabase.from("issues").select("status").then((res: any) => res)
      const { data: allUsersData } = await mockSupabase.from("profiles").select("role").then((res: any) => res)

      setIssues(issuesData || [])
      setAllIssues(allIssuesData || [])
      setAllUsers(allUsersData || [])
      setLoading(false)
    }
    loadData()
  }, [router])

  const totalIssues = allIssues.length || 0
  const pendingIssues = allIssues.filter((i) => i.status === "submitted").length || 0
  const inProgressIssues = allIssues.filter((i) => i.status === "in_progress").length || 0
  const resolvedIssues = allIssues.filter((i) => i.status === "resolved").length || 0
  const totalUsers = allUsers.length || 0
  const totalCitizens = allUsers.filter((u) => u.role === "citizen").length || 0
  const totalAuthorities = allUsers.filter((u) => u.role === "authority").length || 0

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the civic issue reporting system</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalIssues}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{pendingIssues}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{inProgressIssues}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{resolvedIssues}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalUsers}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Citizens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalCitizens}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Authorities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{totalAuthorities}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/admin/analytics">
            <TrendingUp className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/users">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Issues</h2>
          <Button variant="ghost" asChild>
            <Link href="/admin/issues">View All</Link>
          </Button>
        </div>
        {issues && issues.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(issues as Issue[]).map((issue) => (
              <IssueCard key={issue.id} issue={issue} href={`/admin/issues/${issue.id}`} showCitizen />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No issues reported yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
