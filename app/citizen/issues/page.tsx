'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { mockSupabase } from "@/lib/local-db"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { IssueCard } from "@/components/issue-card"
import type { Issue } from "@/lib/types"

export default function CitizenIssuesPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<Issue[]>([])
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
        .eq("citizen_id", user.id)
        .order("created_at", { ascending: false })
        .then((res: any) => res)

      setIssues(issuesData || [])
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) return <div className="p-8 text-center">Loading issues...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Issues</h1>
          <p className="text-muted-foreground">All issues you have reported</p>
        </div>
        <Button asChild>
          <Link href="/citizen/report">
            <PlusCircle className="mr-2 h-4 w-4" />
            Report Issue
          </Link>
        </Button>
      </div>

      {issues && issues.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(issues as Issue[]).map((issue) => (
            <IssueCard key={issue.id} issue={issue} href={`/citizen/issues/${issue.id}`} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven&apos;t reported any issues yet</p>
          <Button asChild>
            <Link href="/citizen/report">
              <PlusCircle className="mr-2 h-4 w-4" />
              Report Your First Issue
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
