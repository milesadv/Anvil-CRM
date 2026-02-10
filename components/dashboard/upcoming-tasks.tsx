import { formatDate, getContactName } from "@/lib/crm-data";
import type { Activity, Contact } from "@/lib/crm-data";
import { cn } from "@/lib/utils";

interface UpcomingTasksProps {
  activities: Activity[];
  contacts: Contact[];
}

export function UpcomingTasks({ activities, contacts }: UpcomingTasksProps) {
  const upcoming = activities
    .filter((a) => !a.completed && a.dueDate)
    .sort(
      (a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
    );

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-5 transition-all duration-200 hover:border-border hover:bg-card/70 sm:p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-foreground">Upcoming</p>
        <span className="rounded-md bg-secondary/70 px-2 py-0.5 text-2xs tabular-nums text-muted-foreground">
          {upcoming.length} pending
        </span>
      </div>
      {upcoming.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground/50">
          No upcoming tasks
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-0.5">
          {upcoming.map((task) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const taskDate = new Date(task.dueDate!);
            taskDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round(
              (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            );
            const isToday = diffDays === 0;
            const isTomorrow = diffDays === 1;

            return (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50"
              >
                <div
                  className={cn(
                    "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                    isToday
                      ? "bg-foreground shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                      : isTomorrow
                        ? "bg-foreground/40"
                        : "bg-muted-foreground/25",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{task.title}</p>
                  <p className="mt-0.5 text-2xs text-muted-foreground/60">
                    {getContactName(task.contactId, contacts)}
                  </p>
                </div>
                <span
                  className={cn(
                    "flex-shrink-0 text-xs tabular-nums",
                    isToday
                      ? "font-medium text-foreground"
                      : "text-muted-foreground/60",
                  )}
                >
                  {isToday
                    ? "Today"
                    : isTomorrow
                      ? "Tomorrow"
                      : formatDate(task.dueDate!)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
