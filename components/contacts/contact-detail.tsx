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
        className="w-[400px] overflow-y-auto border-border bg-background p-0 sm:max-w-[400px]"
      >
        {contact && (
          <>
            <SheetHeader className="px-6 pt-5 pb-0">
              <SheetDescription className="text-xs text-muted-foreground">
                Contact
              </SheetDescription>
              <SheetTitle className="sr-only">{contact.name}</SheetTitle>
            </SheetHeader>

            {/* Profile */}
            <div className="px-6 pb-6 pt-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-secondary text-sm font-medium text-muted-foreground">
                    {contact.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                {[
                  { label: "Email", value: contact.email },
                  { label: "Phone", value: contact.phone },
                  { label: "Company", value: contact.company },
                ].map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between py-1.5">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-base text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>

              {contact.notes && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
                    {contact.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="flex-1 rounded-md bg-secondary py-2 text-center text-sm text-foreground transition-colors hover:bg-accent"
                >
                  Email
                </a>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 rounded-md bg-secondary py-2 text-center text-sm text-foreground transition-colors hover:bg-accent"
                >
                  Call
                </a>
                <button
                  type="button"
                  onClick={onEdit}
                  className="flex-1 rounded-md bg-secondary py-2 text-center text-sm text-foreground transition-colors hover:bg-accent"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Deals */}
            <div className="border-t border-border px-6 py-5">
              <p className="text-xs text-muted-foreground">Deals ({contactDeals.length})</p>
              <div className="mt-3 flex flex-col gap-1">
                {contactDeals.length > 0 ? (
                  contactDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <div>
                        <p className="text-base text-foreground">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">{stageLabels[deal.stage]}</p>
                      </div>
                      <span className="text-base tabular-nums text-foreground">
                        {formatCurrency(deal.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-sm text-muted-foreground/50">No deals yet</p>
                )}
              </div>
            </div>

            {/* Activities */}
            <div className="border-t border-border px-6 py-5">
              <p className="text-xs text-muted-foreground">
                Activity ({contactActivities.length})
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {contactActivities.length > 0 ? (
                  contactActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <div>
                        <p className="text-base text-foreground">{activity.title}</p>
                        <p className="text-xs capitalize text-muted-foreground">{activity.type}</p>
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {getRelativeDate(activity.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-sm text-muted-foreground/50">No activity yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
