import { getRelativeDate, getContactName } from "@/lib/crm-data"
import type { Activity, Contact } from "@/lib/crm-data"
import { cn } from "@/lib/utils"

interface RecentActivityProps {
  activities: Activity[]
  contacts: Contact[]
}

export function RecentActivity({ activities, contacts }: RecentActivityProps) {
  const sorted = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div>
      <p className="text-[12px] text-muted-foreground">Recent activity</p>
      {sorted.length === 0 ? (
        <p className="mt-6 text-[13px] text-muted-foreground/50">No activity logged yet</p>
      ) : (
        <div className="mt-4 flex flex-col">
          {sorted.slice(0, 6).map((activity, i) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-center gap-4 py-2.5",
                i < Math.min(sorted.length, 6) - 1 && "border-b border-border"
              )}
            >
              <span className="w-14 flex-shrink-0 text-[11px] capitalize text-muted-foreground">
                {activity.type}
              </span>
              <p className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                {activity.title}
              </p>
              <div className="flex flex-shrink-0 items-center gap-4">
                {activity.completed && (
                  <span className="text-[11px] text-emerald-400">Done</span>
                )}
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {getRelativeDate(activity.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
