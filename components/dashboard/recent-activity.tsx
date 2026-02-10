import { getRelativeDate } from "@/lib/crm-data"
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
    <div className="rounded-xl border border-border/60 bg-card/50 p-5 sm:p-6">
      <p className="text-sm font-medium text-foreground">Recent activity</p>
      {sorted.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground/50">No activity logged yet</p>
      ) : (
        <div className="mt-4 flex flex-col">
          {sorted.slice(0, 6).map((activity, i) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-center gap-3 py-2.5",
                i < Math.min(sorted.length, 6) - 1 && "border-b border-border/40"
              )}
            >
              <span className="inline-flex w-14 flex-shrink-0 items-center justify-center rounded-md bg-secondary/70 px-1.5 py-0.5 text-2xs capitalize text-muted-foreground">
                {activity.type}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                {activity.title}
              </p>
              <div className="flex flex-shrink-0 items-center gap-3">
                {activity.completed && (
                  <span className="text-2xs text-success">Done</span>
                )}
                <span className="text-2xs tabular-nums text-muted-foreground/60">
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
