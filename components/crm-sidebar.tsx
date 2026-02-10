"use client"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/crm-data"

export type CrmView = "overview" | "contacts" | "pipeline" | "activity"

const navItems: { id: CrmView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline" },
  { id: "contacts", label: "Contacts" },
  { id: "activity", label: "Activity" },
]

interface CrmNavProps {
  activeView: CrmView
  onNavigate: (view: CrmView) => void
}

export function CrmNav({ activeView, onNavigate }: CrmNavProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-8">
        {/* Wordmark */}
        <button
          type="button"
          onClick={() => onNavigate("overview")}
          className="text-[13px] font-semibold tracking-tight text-foreground"
        >
          anvil
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-border" />

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-[13px] transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[15px] h-px bg-foreground" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="text-[12px] text-muted-foreground">
          {formatDate(new Date().toISOString())}
        </span>
        <div className="h-7 w-7 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground flex items-center justify-center">
          JD
        </div>
      </div>
    </header>
  )
}
