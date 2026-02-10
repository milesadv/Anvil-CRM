"use client"

import type { Contact, Deal, Activity } from "@/lib/crm-data"
import { formatCurrency, getRelativeDate, stageLabels } from "@/lib/crm-data"
import { cn } from "@/lib/utils"

interface ContactDetailProps {
  contact: Contact | null
  open: boolean
  onClose: () => void
  deals: Deal[]
  activities: Activity[]
}

export function ContactDetail({ contact, open, onClose, deals, activities }: ContactDetailProps) {
  if (!contact) return null

  const contactDeals = deals.filter((d) => d.contactId === contact.id)
  const contactActivities = activities.filter((a) => a.contactId === contact.id)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose()
          }}
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[400px] overflow-y-auto border-l border-border bg-background transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <span className="text-[11px] text-muted-foreground">Contact</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Close
          </button>
        </div>

        {/* Profile */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-[12px] font-medium text-muted-foreground">
              {contact.avatar}
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-foreground">{contact.name}</h3>
              <p className="text-[12px] text-muted-foreground">{contact.role}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {[
              { label: "Email", value: contact.email },
              { label: "Phone", value: contact.phone },
              { label: "Company", value: contact.company },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline justify-between py-1.5">
                <span className="text-[11px] text-muted-foreground">{item.label}</span>
                <span className="text-[13px] text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <a
              href={`mailto:${contact.email}`}
              className="flex-1 rounded-md bg-secondary py-2 text-center text-[12px] text-foreground transition-colors hover:bg-accent"
            >
              Email
            </a>
            <a
              href={`tel:${contact.phone}`}
              className="flex-1 rounded-md bg-secondary py-2 text-center text-[12px] text-foreground transition-colors hover:bg-accent"
            >
              Call
            </a>
          </div>
        </div>

        {/* Deals */}
        <div className="border-t border-border px-6 py-5">
          <p className="text-[11px] text-muted-foreground">Deals ({contactDeals.length})</p>
          <div className="mt-3 flex flex-col gap-1">
            {contactDeals.length > 0 ? (
              contactDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-secondary"
                >
                  <div>
                    <p className="text-[13px] text-foreground">{deal.title}</p>
                    <p className="text-[11px] text-muted-foreground">{stageLabels[deal.stage]}</p>
                  </div>
                  <span className="text-[13px] tabular-nums text-foreground">
                    {formatCurrency(deal.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-2 text-[12px] text-muted-foreground/50">No deals yet</p>
            )}
          </div>
        </div>

        {/* Activities */}
        <div className="border-t border-border px-6 py-5">
          <p className="text-[11px] text-muted-foreground">
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
                    <p className="text-[13px] text-foreground">{activity.title}</p>
                    <p className="text-[11px] capitalize text-muted-foreground">{activity.type}</p>
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {getRelativeDate(activity.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-2 text-[12px] text-muted-foreground/50">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
