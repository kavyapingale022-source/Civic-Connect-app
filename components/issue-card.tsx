"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, User } from "lucide-react"
import type { Issue } from "@/lib/types"
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/types"

interface IssueCardProps {
  issue: Issue
  href: string
  showCitizen?: boolean
}

export function IssueCard({ issue, href, showCitizen = false }: IssueCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge className={STATUS_COLORS[issue.status]}>{STATUS_LABELS[issue.status]}</Badge>
            <Badge variant="outline">{CATEGORY_LABELS[issue.category]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {issue.photo_urls?.[0] && (
            <img
              src={issue.photo_urls[0] || "/placeholder.svg"}
              alt="Issue"
              className="w-full h-32 object-cover rounded-md"
            />
          )}
          <p className="text-sm line-clamp-2">{issue.description}</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {issue.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{issue.address}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
            {showCitizen && issue.citizen && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{issue.citizen.full_name || issue.citizen.email}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
