"use client"

import { cn } from "@/lib/utils"

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
    <div className="sticky top-0 z-40 flex flex-col items-center px-6 pt-5 pb-2">
      <span className="mb-3 text-sm font-semibold tracking-[0.2em] text-white/90">
        anvil.
      </span>
      <nav className="flex items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.04] p-1 backdrop-blur-2xl">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative rounded-sm px-5 py-2 text-xs font-medium tracking-wide transition-all duration-150",
                isActive
                  ? "bg-white text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
