"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { IssueStatus } from "@/lib/types"
import { STATUS_LABELS } from "@/lib/types"

interface UpdateStatusFormProps {
  issueId: string
  currentStatus: IssueStatus
}

export function UpdateStatusForm({ issueId, currentStatus }: UpdateStatusFormProps) {
  const router = useRouter()
  const [status, setStatus] = useState<IssueStatus>(currentStatus)
  const [remarks, setRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableStatuses: IssueStatus[] = currentStatus === "submitted" ? ["in_progress", "resolved"] : ["resolved"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === currentStatus) {
      setError("Please select a different status")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Update the issue status
    const { error: updateError } = await supabase
      .from("issues")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", issueId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Add status log
    const { error: logError } = await supabase.from("status_logs").insert({
      issue_id: issueId,
      old_status: currentStatus,
      new_status: status,
      remarks: remarks || null,
      changed_by: user?.id,
    })

    if (logError) {
      console.error("Failed to add status log:", logError)
    }

    toast.success("Status updated successfully!")
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="status">New Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks (Optional)</Label>
        <Textarea
          id="remarks"
          placeholder="Add any notes about the status change..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading || status === currentStatus}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Status
      </Button>
    </form>
  )
}
