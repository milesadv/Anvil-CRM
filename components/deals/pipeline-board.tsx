"use client";

import { useState } from "react";
import {
  formatCurrency,
  formatDate,
  stageLabels,
  getContactName,
} from "@/lib/crm-data";
import type { Deal, DealStage, Contact } from "@/lib/crm-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AddDealDialog } from "./add-deal-dialog";

const stageOrder: DealStage[] = [
  "discovery",
  "pricing",
  "negotiating",
  "closing",
];

function DealCard({ deal, contacts }: { deal: Deal; contacts: Contact[] }) {
  return (
    <div className="border-b border-border/40 px-3.5 py-3 transition-all duration-150 last:border-0 hover:bg-white/[0.03] hover:pl-4">
      <p className="text-sm text-foreground">{deal.title}</p>
      <p className="mt-0.5 text-2xs text-muted-foreground/60">
        {getContactName(deal.contactId, contacts)}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-base font-medium tabular-nums text-foreground">
          {formatCurrency(deal.amount)}
        </span>
        {deal.expectedCloseDate && (
          <span className="text-2xs tabular-nums text-muted-foreground/50">
            {formatDate(deal.expectedCloseDate)}
          </span>
        )}
      </div>
    </div>
  );
}

interface PipelineBoardProps {
  deals: Deal[];
  contacts: Contact[];
  onDealAdded: () => void;
}

export function PipelineBoard({
  deals,
  contacts,
  onDealAdded,
}: PipelineBoardProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 pb-4 sm:px-6">
        <span className="text-xs tabular-nums text-muted-foreground/60">
          {deals.length} active deals
        </span>
        <Button
          size="sm"
          className="h-7 rounded-lg bg-foreground px-3.5 text-xs font-medium text-background shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-foreground/90"
          onClick={() => setAddOpen(true)}
        >
          New deal
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-8 sm:gap-3.5 sm:px-6">
        {stageOrder.map((stageKey) => {
          const stageDeals = deals.filter((d) => d.stage === stageKey);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

          return (
            <div
              key={stageKey}
              className="flex w-52 flex-shrink-0 flex-col sm:w-60"
            >
              <div className="mb-2.5 flex items-baseline justify-between px-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {stageLabels[stageKey]}
                  </span>
                  <span className="text-2xs tabular-nums text-muted-foreground/40">
                    {stageDeals.length}
                  </span>
                </div>
                {stageDeals.length > 0 && (
                  <span className="text-2xs tabular-nums text-muted-foreground/40">
                    {formatCurrency(stageTotal)}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex-1 overflow-hidden rounded-xl",
                  stageDeals.length > 0
                    ? "border border-border/50 bg-card/40"
                    : "border border-dashed border-border/30",
                )}
              >
                {stageDeals.length > 0 ? (
                  stageDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} contacts={contacts} />
                  ))
                ) : (
                  <div className="flex items-center justify-center py-14">
                    <p className="text-2xs text-muted-foreground/30">
                      No deals
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddDealDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        contacts={contacts}
        onDealAdded={onDealAdded}
      />
    </>
  );
}
