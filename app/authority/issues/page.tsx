import { createClient } from "@/lib/supabase/server"
import { IssueCard } from "@/components/issue-card"
import type { Issue } from "@/lib/types"

export default async function AuthorityIssuesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: issues } = await supabase
    .from("issues")
    .select("*, citizen:profiles!issues_citizen_id_fkey(*)")
    .eq("assigned_authority_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assigned Issues</h1>
        <p className="text-muted-foreground">All issues assigned to you for resolution</p>
      </div>

      {issues && issues.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(issues as Issue[]).map((issue) => (
            <IssueCard key={issue.id} issue={issue} href={`/authority/issues/${issue.id}`} showCitizen />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No issues assigned to you yet</p>
        </div>
      )}
    </div>
  )
}
