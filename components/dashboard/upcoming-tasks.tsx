import { formatDate, getContactName } from "@/lib/crm-data"
import type { Activity, Contact } from "@/lib/crm-data"
import { cn } from "@/lib/utils"

interface UpcomingTasksProps {
  activities: Activity[]
  contacts: Contact[]
}

export function UpcomingTasks({ activities, contacts }: UpcomingTasksProps) {
  const upcoming = activities
    .filter((a) => !a.completed && a.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-base font-medium text-foreground">Upcoming</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {upcoming.length} pending
        </p>
      </div>
      {upcoming.length === 0 ? (
        <p className="mt-6 text-base text-muted-foreground/50">No upcoming tasks</p>
      ) : (
        <div className="mt-4 flex flex-col gap-1">
          {upcoming.map((task) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const taskDate = new Date(task.dueDate!)
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
                  <p className="text-base text-foreground">{task.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {getContactName(task.contactId, contacts)}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex-shrink-0 text-sm tabular-nums",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(task.dueDate!)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
