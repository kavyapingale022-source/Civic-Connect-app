import type { StatusLog } from "@/lib/types"
import { STATUS_LABELS } from "@/lib/types"
import { CheckCircle2 } from "lucide-react"

interface StatusTimelineProps {
  logs: StatusLog[]
}

export function StatusTimeline({ logs }: StatusTimelineProps) {
  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="p-1 rounded-full bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            {index < logs.length - 1 && <div className="w-px h-full bg-border flex-1" />}
          </div>
          <div className="pb-4">
            <p className="font-medium text-sm">Status changed to {STATUS_LABELS[log.new_status]}</p>
            {log.remarks && <p className="text-sm text-muted-foreground mt-1">{log.remarks}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(log.created_at).toLocaleString()}
              {log.changer && ` by ${log.changer.full_name || log.changer.email}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
