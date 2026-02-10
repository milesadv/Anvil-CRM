"use client"

import { useState } from "react"
import { getRelativeDate } from "@/lib/crm-data"
import type { Contact, ContactStatus, Deal, Activity } from "@/lib/crm-data"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ContactDetail } from "./contact-detail"
import { AddContactDialog } from "./add-contact-dialog"
import { EditContactDialog } from "./edit-contact-dialog"

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
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [editOpen, setEditOpen] = useState(false)

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
      <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors",
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
            className="h-8 min-w-0 flex-1 text-sm sm:w-52 sm:flex-none"
          />
          <Button
            size="sm"
            className="h-7 shrink-0 rounded-md bg-foreground px-3 text-sm font-normal text-background hover:bg-foreground/90"
            onClick={() => setAddOpen(true)}
          >
            New contact
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-4 pb-8 sm:px-6">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">No contacts yet</p>
            <p className="mt-1 text-sm text-muted-foreground/50">
              Add your first contact to get started
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {["Name", "Company", "Status", "Last contact"].map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-secondary text-2xs font-medium text-muted-foreground">
                            {contact.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-base text-foreground">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-base text-foreground">{contact.company}</p>
                      <p className="text-xs text-muted-foreground">{contact.role}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            contact.status === "customer" && "bg-success",
                            contact.status === "prospect" && "bg-foreground/40",
                            contact.status === "lead" && "bg-primary",
                            contact.status === "churned" && "bg-destructive"
                          )}
                        />
                        <span className="text-sm capitalize text-muted-foreground">
                          {contact.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {getRelativeDate(contact.lastContact)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <p className="text-base text-muted-foreground">No contacts found</p>
              </div>
            )}
          </>
        )}
      </div>

      <ContactDetail
        contact={selectedContact}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        onEdit={() => {
          setEditContact(selectedContact)
          setSelectedContact(null)
          setEditOpen(true)
        }}
        deals={deals}
        activities={activities}
      />

      <AddContactDialog open={addOpen} onOpenChange={setAddOpen} onContactAdded={onContactAdded} />
      <EditContactDialog contact={editContact} open={editOpen} onOpenChange={setEditOpen} onContactUpdated={onContactAdded} />
    </>
  )
}
