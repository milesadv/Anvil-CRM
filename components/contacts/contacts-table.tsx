"use client"

import { useState } from "react"
import { getRelativeDate } from "@/lib/crm-data"
import type { Contact, ContactStatus, Deal, Activity } from "@/lib/crm-data"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ContactDetail } from "./contact-detail"
import { AddContactDialog } from "./add-contact-dialog"

const statusFilters: { label: string; value: ContactStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Leads", value: "lead" },
  { label: "Prospects", value: "prospect" },
  { label: "Customers", value: "customer" },
  { label: "Churned", value: "churned" },
]

interface ContactsTableProps {
  contacts: Contact[]
  deals: Deal[]
  activities: Activity[]
  onContactAdded: () => void
}

export function ContactsTable({ contacts, deals, activities, onContactAdded }: ContactsTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 pb-4">
        <div className="flex items-center gap-1">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[12px] transition-colors",
                statusFilter === filter.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-52 border-border bg-secondary text-[12px] text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/20"
          />
          <Button
            size="sm"
            className="h-7 rounded-md bg-foreground px-3 text-[12px] font-normal text-background hover:bg-foreground/90"
            onClick={() => setAddOpen(true)}
          >
            New contact
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-8">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[14px] text-muted-foreground">No contacts yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground/50">
              Add your first contact to get started
            </p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Company", "Status", "Last contact"].map((header) => (
                    <th key={header} className="px-3 py-2.5 text-left">
                      <span className="text-[11px] text-muted-foreground">{header}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact, i) => (
                  <tr
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-secondary/50",
                      i < filtered.length - 1 && "border-b border-border"
                    )}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">
                          {contact.avatar}
                        </div>
                        <div>
                          <p className="text-[13px] text-foreground">{contact.name}</p>
                          <p className="text-[11px] text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[13px] text-foreground">{contact.company}</p>
                      <p className="text-[11px] text-muted-foreground">{contact.role}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            contact.status === "customer" && "bg-emerald-400",
                            contact.status === "prospect" && "bg-foreground/40",
                            contact.status === "lead" && "bg-primary",
                            contact.status === "churned" && "bg-red-400"
                          )}
                        />
                        <span className="text-[12px] capitalize text-muted-foreground">
                          {contact.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[12px] tabular-nums text-muted-foreground">
                        {getRelativeDate(contact.lastContact)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <p className="text-[13px] text-muted-foreground">No contacts found</p>
              </div>
            )}
          </>
        )}
      </div>

      <ContactDetail
        contact={selectedContact}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        deals={deals}
        activities={activities}
      />

      <AddContactDialog open={addOpen} onOpenChange={setAddOpen} onContactAdded={onContactAdded} />
    </>
  )
}
