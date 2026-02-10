"use client"

import { useState } from "react"
import { formatCurrency, formatDate, stageLabels, getContactName } from "@/lib/crm-data"
import type { Deal, DealStage, Contact } from "@/lib/crm-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AddDealDialog } from "./add-deal-dialog"

const stageOrder: DealStage[] = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]

function DealCard({ deal, contacts }: { deal: Deal; contacts: Contact[] }) {
  return (
    <div className="group border-b border-border px-3 py-3 transition-colors last:border-0 hover:bg-secondary/50">
      <p className="text-[13px] text-foreground">{deal.title}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {getContactName(deal.contactId, contacts)}
      </p>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[15px] font-medium tabular-nums text-foreground">
          {formatCurrency(deal.amount)}
        </span>
        {deal.expectedCloseDate && (
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {formatDate(deal.expectedCloseDate)}
          </span>
        )}
      </div>
    </div>
  )
}

interface PipelineBoardProps {
  deals: Deal[]
  contacts: Contact[]
  onDealAdded: () => void
}

export function PipelineBoard({ deals, contacts, onDealAdded }: PipelineBoardProps) {
  const [addOpen, setAddOpen] = useState(false)

  const activeDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")

  return (
    <>
      <div className="flex items-center justify-between px-6 pb-4">
        <span className="text-[12px] tabular-nums text-muted-foreground">
          {activeDeals.length} active deals
        </span>
        <Button
          size="sm"
          className="h-7 rounded-md bg-foreground px-3 text-[12px] font-normal text-background hover:bg-foreground/90"
          onClick={() => setAddOpen(true)}
        >
          New deal
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto px-6 pb-8">
        {stageOrder.map((stageKey) => {
          const stageDeals = deals.filter((d) => d.stage === stageKey)
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0)

          return (
            <div key={stageKey} className="flex w-48 flex-shrink-0 flex-col">
              <div className="mb-2 flex items-baseline justify-between px-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] text-muted-foreground">
                    {stageLabels[stageKey]}
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground/60">
                    {stageDeals.length}
                  </span>
                </div>
                {stageDeals.length > 0 && (
                  <span className="text-[11px] tabular-nums text-muted-foreground/60">
                    {formatCurrency(stageTotal)}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex-1 overflow-hidden rounded-lg",
                  stageDeals.length > 0 ? "bg-card" : "border border-dashed border-border"
                )}
              >
                {stageDeals.length > 0 ? (
                  stageDeals.map((deal) => <DealCard key={deal.id} deal={deal} contacts={contacts} />)
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-[11px] text-muted-foreground/50">No deals</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AddDealDialog open={addOpen} onOpenChange={setAddOpen} contacts={contacts} onDealAdded={onDealAdded} />
    </>
  )
}
