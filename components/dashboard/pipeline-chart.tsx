"use client";

import { formatCurrency, stageLabels } from "@/lib/crm-data";
import type { Deal, DealStage } from "@/lib/crm-data";

const stages: DealStage[] = ["discovery", "pricing", "negotiating", "closing"];

interface PipelineChartProps {
  deals: Deal[];
}

export function PipelineChart({ deals }: PipelineChartProps) {
  const stageData = stages.map((key) => {
    const stageDeals = deals.filter((d) => d.stage === key);
    const total = stageDeals.reduce((sum, d) => sum + d.amount, 0);
    return { key, label: stageLabels[key], count: stageDeals.length, total };
  });

  const maxTotal = Math.max(...stageData.map((s) => s.total), 1);

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-5 transition-all duration-200 hover:border-border hover:bg-card/70 sm:p-6">
      <p className="text-sm font-medium text-foreground">Pipeline breakdown</p>
      {deals.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground/50">
          No deals in the pipeline yet
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3.5">
          {stageData.map((stage) => {
            const widthPercent =
              maxTotal > 0 ? Math.max((stage.total / maxTotal) * 100, 4) : 4;
            return (
              <div key={stage.key} className="flex items-center gap-3 sm:gap-4">
                <span className="w-20 flex-shrink-0 text-xs text-muted-foreground sm:w-24">
                  {stage.label}
                </span>
                <div className="relative flex-1">
                  <div className="h-6 w-full overflow-hidden rounded-md bg-secondary/60">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-foreground/20 to-foreground/30 transition-all duration-700 ease-out"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
                <div className="flex w-20 flex-shrink-0 items-center justify-end gap-3 sm:w-28 sm:gap-4">
                  <span className="text-sm tabular-nums text-foreground">
                    {formatCurrency(stage.total)}
                  </span>
                  <span className="hidden text-xs tabular-nums text-muted-foreground/60 sm:inline">
                    {stage.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
