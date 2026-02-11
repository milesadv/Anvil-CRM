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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AddDealDialog } from "./add-deal-dialog";
import { EditDealDialog } from "./edit-deal-dialog";
import { createBrowserClient } from "@/lib/supabase";

const stageOrder: DealStage[] = [
  "discovery",
  "pricing",
  "negotiating",
  "closing",
];

function DealCard({
  deal,
  contacts,
  onEdit,
  onMoveStage,
}: {
  deal: Deal;
  contacts: Contact[];
  onEdit: (deal: Deal) => void;
  onMoveStage: (deal: Deal, direction: "prev" | "next") => void;
}) {
  const stageIdx = stageOrder.indexOf(deal.stage);
  const canMoveLeft = stageIdx > 0;
  const canMoveRight = stageIdx < stageOrder.length - 1;

  return (
    <div
      className="group cursor-pointer border-b border-border/40 px-3.5 py-3 transition-all duration-150 last:border-0 hover:bg-white/[0.03]"
      onClick={() => onEdit(deal)}
    >
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
      {/* Stage movement arrows — visible on hover */}
      <div className="mt-2 flex items-center justify-between opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <button
          disabled={!canMoveLeft}
          className={cn(
            "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs transition-colors",
            canMoveLeft
              ? "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              : "cursor-default text-muted-foreground/20",
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (canMoveLeft) onMoveStage(deal, "prev");
          }}
        >
          <ChevronLeft className="h-3 w-3" />
          {canMoveLeft && <span>{stageLabels[stageOrder[stageIdx - 1]]}</span>}
        </button>
        <button
          disabled={!canMoveRight}
          className={cn(
            "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs transition-colors",
            canMoveRight
              ? "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              : "cursor-default text-muted-foreground/20",
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (canMoveRight) onMoveStage(deal, "next");
          }}
        >
          {canMoveRight && <span>{stageLabels[stageOrder[stageIdx + 1]]}</span>}
          <ChevronRight className="h-3 w-3" />
        </button>
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
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  function handleEditDeal(deal: Deal) {
    setEditDeal(deal);
    setEditOpen(true);
  }

  async function handleMoveStage(deal: Deal, direction: "prev" | "next") {
    const currentIdx = stageOrder.indexOf(deal.stage);
    const newIdx = direction === "next" ? currentIdx + 1 : currentIdx - 1;
    if (newIdx < 0 || newIdx >= stageOrder.length) return;

    const newStage = stageOrder[newIdx];
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("deals")
      .update({ stage: newStage })
      .eq("id", deal.id);

    if (!error) {
      onDealAdded(); // refreshAll
    }
  }

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
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      contacts={contacts}
                      onEdit={handleEditDeal}
                      onMoveStage={handleMoveStage}
                    />
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

      <EditDealDialog
        deal={editDeal}
        open={editOpen}
        onOpenChange={setEditOpen}
        contacts={contacts}
        onDealUpdated={onDealAdded}
      />
    </>
  );
}
