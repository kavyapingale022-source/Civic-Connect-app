import { createClient } from "@/lib/supabase/server"
import { IssueCard } from "@/components/issue-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import type { Issue } from "@/lib/types"

export default async function CitizenIssuesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: issues } = await supabase
    .from("issues")
    .select("*, citizen:profiles!issues_citizen_id_fkey(*)")
    .eq("citizen_id", user?.id)
    .order("created_at", { ascending: false })

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
