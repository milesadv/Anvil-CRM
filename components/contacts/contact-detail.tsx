"use client"

import type { Contact, Deal, Activity } from "@/lib/crm-data"
import { formatCurrency, getRelativeDate, stageLabels } from "@/lib/crm-data"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ContactDetailProps {
  contact: Contact | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  deals: Deal[]
  activities: Activity[]
}

export function ContactDetail({ contact, open, onClose, onEdit, deals, activities }: ContactDetailProps) {
  const contactDeals = contact ? deals.filter((d) => d.contactId === contact.id) : []
  const contactActivities = contact ? activities.filter((a) => a.contactId === contact.id) : []

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-border/50 bg-background p-0 sm:w-[420px] sm:max-w-[420px]"
      >
        {contact && (
          <>
            <SheetHeader className="px-6 pt-5 pb-0">
              <SheetDescription className="text-2xs uppercase tracking-wider text-muted-foreground/50">
                Contact
              </SheetDescription>
              <SheetTitle className="sr-only">{contact.name}</SheetTitle>
            </SheetHeader>

            {/* Profile */}
            <div className="px-6 pb-6 pt-4">
              <div className="flex items-center gap-3.5">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-secondary/80 text-sm font-medium text-muted-foreground">
                    {contact.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{contact.name}</h3>
                  <p className="text-xs text-muted-foreground/60">{contact.role}</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-border/40 bg-card/30">
                {[
                  { label: "Email", value: contact.email },
                  { label: "Phone", value: contact.phone },
                  { label: "Company", value: contact.company },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-baseline justify-between px-4 py-3",
                      i < 2 && "border-b border-border/30"
                    )}
                  >
                    <span className="text-2xs uppercase tracking-wider text-muted-foreground/40">{item.label}</span>
                    <span className="text-sm text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              {contact.notes && (
                <div className="mt-4 rounded-xl border border-border/40 bg-card/30 px-4 py-3">
                  <p className="text-2xs uppercase tracking-wider text-muted-foreground/40">Notes</p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/70">
                    {contact.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="flex-1 rounded-lg border border-border/40 bg-card/30 py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  Email
                </a>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 rounded-lg border border-border/40 bg-card/30 py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  Call
                </a>
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex-1 rounded-lg border border-border/40 bg-card/30 py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Deals */}
            <div className="border-t border-border/30 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <p className="text-2xs uppercase tracking-wider text-muted-foreground/40">Deals</p>
                <span className="text-2xs tabular-nums text-muted-foreground/30">{contactDeals.length}</span>
              </div>
              <div className="mt-3 flex flex-col gap-0.5">
                {contactDeals.length > 0 ? (
                  contactDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
                    >
                      <div>
                        <p className="text-sm text-foreground">{deal.title}</p>
                        <p className="text-2xs text-muted-foreground/50">{stageLabels[deal.stage]}</p>
                      </div>
                      <span className="text-sm tabular-nums font-medium text-foreground">
                        {formatCurrency(deal.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-3 text-center text-xs text-muted-foreground/30">No deals yet</p>
                )}
              </div>
            </div>

            {/* Activities */}
            <div className="border-t border-border/30 px-6 py-5">
              <div className="flex items-baseline justify-between">
                <p className="text-2xs uppercase tracking-wider text-muted-foreground/40">Activity</p>
                <span className="text-2xs tabular-nums text-muted-foreground/30">{contactActivities.length}</span>
              </div>
              <div className="mt-3 flex flex-col gap-0.5">
                {contactActivities.length > 0 ? (
                  contactActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-card/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex w-12 items-center justify-center rounded-md bg-secondary/50 px-1.5 py-0.5 text-2xs capitalize text-muted-foreground/60">
                          {activity.type}
                        </span>
                        <p className="text-sm text-foreground">{activity.title}</p>
                      </div>
                      <span className="text-2xs tabular-nums text-muted-foreground/40">
                        {getRelativeDate(activity.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-3 text-center text-xs text-muted-foreground/30">No activity yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
