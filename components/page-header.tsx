import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-end justify-between px-6 pb-6 pt-8",
        className
      )}
    >
      <div>
        <h1 className="text-[20px] font-medium tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
