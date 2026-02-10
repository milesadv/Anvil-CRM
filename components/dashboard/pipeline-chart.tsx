"use client"

import { formatCurrency, stageLabels } from "@/lib/crm-data"
import type { Deal, DealStage } from "@/lib/crm-data"

const stages: DealStage[] = ["discovery", "pricing", "negotiating", "closing"]

interface PipelineChartProps {
  deals: Deal[]
}

export function PipelineChart({ deals }: PipelineChartProps) {
  const stageData = stages.map((key) => {
    const stageDeals = deals.filter((d) => d.stage === key)
    const total = stageDeals.reduce((sum, d) => sum + d.amount, 0)
    return { key, label: stageLabels[key], count: stageDeals.length, total }
  })

  const maxTotal = Math.max(...stageData.map((s) => s.total), 1)

  return (
    <div>
      <p className="text-base font-medium text-foreground">Pipeline breakdown</p>
      {deals.length === 0 ? (
        <p className="mt-6 text-base text-muted-foreground/50">No deals in the pipeline yet</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {stageData.map((stage) => {
            const widthPercent = maxTotal > 0 ? Math.max((stage.total / maxTotal) * 100, 4) : 4
            return (
              <div key={stage.key} className="flex items-center gap-3 sm:gap-4">
                <span className="w-20 flex-shrink-0 text-sm text-muted-foreground sm:w-28">
                  {stage.label}
                </span>
                <div className="relative flex-1">
                  <div className="h-5 w-full overflow-hidden rounded-sm bg-secondary">
                    <div
                      className="h-full rounded-sm bg-foreground/25 transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
                <div className="flex w-20 flex-shrink-0 items-center justify-end gap-3 sm:w-28 sm:gap-4">
                  <span className="text-base tabular-nums text-foreground">
                    {formatCurrency(stage.total)}
                  </span>
                  <span className="hidden text-sm tabular-nums text-muted-foreground sm:inline">
                    {stage.count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
