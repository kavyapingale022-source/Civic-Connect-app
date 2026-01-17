import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { IssueCard } from "@/components/issue-card"
import type { Issue } from "@/lib/types"

export default async function CitizenDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: issues } = await supabase
    .from("issues")
    .select("*, citizen:profiles!issues_citizen_id_fkey(*)")
    .eq("citizen_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(6)

  const { data: stats } = await supabase.from("issues").select("status").eq("citizen_id", user?.id)

  const totalIssues = stats?.length || 0
  const pendingIssues = stats?.filter((i) => i.status === "submitted").length || 0
  const inProgressIssues = stats?.filter((i) => i.status === "in_progress").length || 0
  const resolvedIssues = stats?.filter((i) => i.status === "resolved").length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Track and manage your civic issue reports</p>
        </div>
        <Button asChild>
          <Link href="/citizen/report">
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Issue
          </Link>
        </Button>
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
              <Clock className="h-5 w-5 text-amber-500" />
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

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Issues</h2>
          <Button variant="ghost" asChild>
            <Link href="/citizen/issues">View All</Link>
          </Button>
        </div>
        {issues && issues.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(issues as Issue[]).map((issue) => (
              <IssueCard key={issue.id} issue={issue} href={`/citizen/issues/${issue.id}`} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">You haven&apos;t reported any issues yet</p>
              <Button asChild>
                <Link href="/citizen/report">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Report Your First Issue
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
