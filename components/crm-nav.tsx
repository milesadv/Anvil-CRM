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
    <div className="sticky top-0 z-40 flex flex-col items-center px-4 pt-5 pb-3 sm:px-6 sm:pt-6">
      <span className="mb-3 text-sm font-semibold tracking-[0.2em] text-white/80 sm:mb-4">
        anvil.
      </span>
      <nav className="relative flex w-full items-center justify-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_2px_8px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:w-auto sm:p-1.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "relative flex-1 rounded-lg px-3 py-2 text-xs font-medium tracking-wide transition-all duration-200 sm:flex-none sm:px-6 sm:py-2",
                isActive
                  ? "bg-white/95 text-[#0a0a0a] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
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
