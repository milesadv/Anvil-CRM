"use client";

import { useState } from "react";
import { getRelativeDate, getContactName } from "@/lib/crm-data";
import type { Activity, ActivityType, Contact } from "@/lib/crm-data";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddActivityDialog } from "./add-activity-dialog";

const typeFilters: { label: string; value: ActivityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Calls", value: "call" },
  { label: "Emails", value: "email" },
  { label: "Meetings", value: "meeting" },
  { label: "Notes", value: "note" },
  { label: "Tasks", value: "task" },
];

interface ActivityListProps {
  activities: Activity[];
  contacts: Contact[];
  onActivityAdded: () => void;
}

export function ActivityList({
  activities,
  contacts,
  onActivityAdded,
}: ActivityListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = activities
    .filter((a) => {
      const contactName = getContactName(a.contactId, contacts);
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        contactName.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || a.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex items-center gap-0.5 overflow-x-auto rounded-lg border border-border/40 bg-card/30 p-0.5">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setTypeFilter(filter.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-all duration-150",
                typeFilter === filter.value
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 min-w-0 flex-1 text-sm sm:w-52 sm:flex-none"
          />
          <Button
            size="sm"
            className="h-7 shrink-0 rounded-lg bg-foreground px-3.5 text-xs font-medium text-background shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-foreground/90"
            onClick={() => setAddOpen(true)}
          >
            Log activity
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-8 sm:px-6">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-20">
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="mt-1.5 text-xs text-muted-foreground/40">
              Log your first call, email or meeting
            </p>
          </div>
        ) : (
          <>
            {filtered.map((activity, i) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-2 py-3.5 transition-all duration-150 hover:bg-card/40",
                  i < filtered.length - 1 && "border-b border-border/30",
                )}
              >
                <span className="mt-0.5 inline-flex w-14 flex-shrink-0 items-center justify-center rounded-md bg-secondary/50 px-1.5 py-0.5 text-2xs capitalize text-muted-foreground">
                  {activity.type}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={cn(
                          "text-sm text-foreground",
                          activity.completed &&
                            "text-muted-foreground/60 line-through",
                        )}
                      >
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-2xs text-muted-foreground/50">
                        {getContactName(activity.contactId, contacts)}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      {activity.completed ? (
                        <span className="text-2xs font-medium text-success/80">
                          Done
                        </span>
                      ) : (
                        <span className="text-2xs text-muted-foreground/30">
                          Open
                        </span>
                      )}
                      <span className="text-2xs tabular-nums text-muted-foreground/40">
                        {getRelativeDate(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                  {activity.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground/60">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground/50">
                  No activities found
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <AddActivityDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        contacts={contacts}
        onActivityAdded={onActivityAdded}
      />
    </>
  );
}
