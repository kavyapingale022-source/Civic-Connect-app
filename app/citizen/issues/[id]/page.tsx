import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react"
import Link from "next/link"
import { StatusTimeline } from "@/components/status-timeline"
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/types"
import type { Issue, StatusLog } from "@/lib/types"

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: issue } = await supabase
    .from("issues")
    .select("*, citizen:profiles!issues_citizen_id_fkey(*), authority:profiles!issues_assigned_authority_id_fkey(*)")
    .eq("id", id)
    .eq("citizen_id", user?.id)
    .single()

  if (!issue) {
    notFound()
  }

  const { data: statusLogs } = await supabase
    .from("status_logs")
    .select("*, changer:profiles!status_logs_changed_by_fkey(*)")
    .eq("issue_id", id)
    .order("created_at", { ascending: false })

  const typedIssue = issue as Issue

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/citizen/issues">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Issue Details</h1>
          <p className="text-muted-foreground">Track the progress of your reported issue</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <Badge className={STATUS_COLORS[typedIssue.status]}>{STATUS_LABELS[typedIssue.status]}</Badge>
            <Badge variant="outline">{CATEGORY_LABELS[typedIssue.category]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {typedIssue.photo_urls && typedIssue.photo_urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {typedIssue.photo_urls.map((url, index) => (
                <img
                  key={index}
                  src={url || "/placeholder.svg"}
                  alt={`Issue photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{typedIssue.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {typedIssue.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{typedIssue.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Reported On</p>
                <p className="text-muted-foreground">{new Date(typedIssue.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            {typedIssue.authority && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Assigned To</p>
                  <p className="text-muted-foreground">
                    {typedIssue.authority.full_name || typedIssue.authority.email}
                  </p>
                </div>
              </div>
            )}
          </div>

          {typedIssue.completion_photo_url && (
            <div>
              <h3 className="font-semibold mb-2">Completion Photo</h3>
              <img
                src={typedIssue.completion_photo_url || "/placeholder.svg"}
                alt="Completion"
                className="w-full max-w-sm rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {statusLogs && statusLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline logs={statusLogs as StatusLog[]} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
