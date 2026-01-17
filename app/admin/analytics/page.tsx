import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const { data: issues } = await supabase.from("issues").select("category, status, created_at")

  const categoryStats = Object.keys(CATEGORY_LABELS).map((cat) => ({
    category: CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS],
    count: issues?.filter((i) => i.category === cat).length || 0,
  }))

  const statusStats = Object.keys(STATUS_LABELS).map((stat) => ({
    status: STATUS_LABELS[stat as keyof typeof STATUS_LABELS],
    count: issues?.filter((i) => i.status === stat).length || 0,
  }))

  const totalIssues = issues?.length || 0
  const resolvedIssues = issues?.filter((i) => i.status === "resolved").length || 0
  const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">System-wide statistics and insights</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalIssues}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{resolvedIssues}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{resolutionRate}%</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-sm">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${totalIssues > 0 ? (item.count / totalIssues) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusStats.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${totalIssues > 0 ? (item.count / totalIssues) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
