"use client"

import { useState } from "react"
import { getRelativeDate, getContactName } from "@/lib/crm-data"
import type { Activity, ActivityType, Contact } from "@/lib/crm-data"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddActivityDialog } from "./add-activity-dialog"

const typeFilters: { label: string; value: ActivityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Calls", value: "call" },
  { label: "Emails", value: "email" },
  { label: "Meetings", value: "meeting" },
  { label: "Notes", value: "note" },
  { label: "Tasks", value: "task" },
]

interface ActivityListProps {
  activities: Activity[]
  contacts: Contact[]
  onActivityAdded: () => void
}

export function ActivityList({ activities, contacts, onActivityAdded }: ActivityListProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all")
  const [addOpen, setAddOpen] = useState(false)

  const filtered = activities
    .filter((a) => {
      const contactName = getContactName(a.contactId, contacts)
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        contactName.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || a.type === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 pb-4">
        <div className="flex items-center gap-1">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setTypeFilter(filter.value)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[12px] transition-colors",
                typeFilter === filter.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-52 border-border bg-secondary text-[12px] text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/20"
          />
          <Button
            size="sm"
            className="h-7 rounded-md bg-foreground px-3 text-[12px] font-normal text-background hover:bg-foreground/90"
            onClick={() => setAddOpen(true)}
          >
            Log activity
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="px-6 pb-8">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[14px] text-muted-foreground">No activity yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground/50">
              Log your first call, email or meeting
            </p>
          </div>
        ) : (
          <>
            {filtered.map((activity, i) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-4 py-3.5",
                  i < filtered.length - 1 && "border-b border-border"
                )}
              >
                <span className="mt-0.5 w-14 flex-shrink-0 text-[11px] capitalize text-muted-foreground">
                  {activity.type}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={cn(
                          "text-[13px] text-foreground",
                          activity.completed && "text-muted-foreground line-through"
                        )}
                      >
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {getContactName(activity.contactId, contacts)}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-4">
                      {activity.completed ? (
                        <span className="text-[11px] text-emerald-400">Done</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60">Open</span>
                      )}
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {getRelativeDate(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                  {activity.description && (
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <p className="text-[13px] text-muted-foreground">No activities found</p>
              </div>
            )}
          </>
        )}
      </div>

      <AddActivityDialog open={addOpen} onOpenChange={setAddOpen} contacts={contacts} onActivityAdded={onActivityAdded} />
    </>
  )
}
