import { createClient } from "@/lib/supabase/server"
import { IssueCard } from "@/components/issue-card"
import type { Issue } from "@/lib/types"

export default async function AdminIssuesPage() {
  const supabase = await createClient()

  const { data: issues } = await supabase
    .from("issues")
    .select("*, citizen:profiles!issues_citizen_id_fkey(*)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Issues</h1>
        <p className="text-muted-foreground">View and manage all reported civic issues</p>
      </div>

      {issues && issues.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(issues as Issue[]).map((issue) => (
            <IssueCard key={issue.id} issue={issue} href={`/admin/issues/${issue.id}`} showCitizen />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No issues reported yet</p>
        </div>
      )}
    </div>
  )
}
