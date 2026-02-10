import { formatDate } from "@/lib/crm-data"
import type { Activity } from "@/lib/crm-data"
import { cn } from "@/lib/utils"

interface UpcomingTasksProps {
  activities: Activity[]
}

export function UpcomingTasks({ activities }: UpcomingTasksProps) {
  const upcoming = activities
    .filter((a) => !a.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[12px] text-muted-foreground">Upcoming</p>
        <p className="text-[11px] tabular-nums text-muted-foreground">
          {upcoming.length} pending
        </p>
      </div>
      {upcoming.length === 0 ? (
        <p className="mt-6 text-[13px] text-muted-foreground/50">No upcoming tasks</p>
      ) : (
        <div className="mt-4 flex flex-col gap-1">
          {upcoming.map((task) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const taskDate = new Date(task.date)
            taskDate.setHours(0, 0, 0, 0)
            const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            const isToday = diffDays === 0
            const isTomorrow = diffDays === 1

            return (
              <div
                key={task.id}
                className="flex items-center gap-4 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary"
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                    isToday
                      ? "bg-primary"
                      : isTomorrow
                        ? "bg-foreground/40"
                        : "bg-muted-foreground/30"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-foreground">{task.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{task.contactName}</p>
                </div>
                <span
                  className={cn(
                    "flex-shrink-0 text-[12px] tabular-nums",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(task.date)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
