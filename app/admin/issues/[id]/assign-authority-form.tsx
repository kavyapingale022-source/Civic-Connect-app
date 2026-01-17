"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { Profile } from "@/lib/types"

interface AssignAuthorityFormProps {
  issueId: string
  currentAuthorityId: string | null
  authorities: Profile[]
}

export function AssignAuthorityForm({ issueId, currentAuthorityId, authorities }: AssignAuthorityFormProps) {
  const router = useRouter()
  const [authorityId, setAuthorityId] = useState(currentAuthorityId || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorityId) {
      setError("Please select an authority")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("issues")
      .update({
        assigned_authority_id: authorityId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", issueId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    toast.success("Authority assigned successfully!")
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
        <Label htmlFor="authority">Select Authority</Label>
        <Select value={authorityId} onValueChange={setAuthorityId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an authority" />
          </SelectTrigger>
          <SelectContent>
            {authorities.map((auth) => (
              <SelectItem key={auth.id} value={auth.id}>
                {auth.full_name || auth.email}
                {auth.department && ` (${auth.department})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading || !authorityId}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {currentAuthorityId ? "Reassign Authority" : "Assign Authority"}
      </Button>
    </form>
  )
}
