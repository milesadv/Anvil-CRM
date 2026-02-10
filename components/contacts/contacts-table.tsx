"use client";

import { useState } from "react";
import { getRelativeDate } from "@/lib/crm-data";
import type { Contact, ContactStatus, Deal, Activity } from "@/lib/crm-data";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactDetail } from "./contact-detail";
import { CompanyChatbot } from "./company-chatbot";
import { AddContactDialog } from "./add-contact-dialog";
import { EditContactDialog } from "./edit-contact-dialog";

const statusFilters: { label: string; value: ContactStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Leads", value: "lead" },
  { label: "Prospects", value: "prospect" },
  { label: "Customers", value: "customer" },
  { label: "Churned", value: "churned" },
];

interface ContactsTableProps {
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  onContactAdded: () => void;
}

export function ContactsTable({
  contacts,
  deals,
  activities,
  onContactAdded,
}: ContactsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">(
    "all",
  );
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex items-center gap-0.5 overflow-x-auto rounded-lg border border-border/40 bg-card/30 p-0.5">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-all duration-150",
                statusFilter === filter.value
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 min-w-0 flex-1 text-sm sm:w-52 sm:flex-none"
          />
          <Button
            size="sm"
            className="h-7 shrink-0 rounded-lg bg-foreground px-3.5 text-xs font-medium text-background shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:bg-foreground/90"
            onClick={() => setAddOpen(true)}
          >
            New contact
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-4 pb-8 sm:px-6">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-20">
            <p className="text-sm text-muted-foreground">No contacts yet</p>
            <p className="mt-1.5 text-xs text-muted-foreground/40">
              Add your first contact to get started
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { label: "Name", hideOnMobile: false },
                    { label: "Company", hideOnMobile: false },
                    { label: "Status", hideOnMobile: true },
                    { label: "Last contact", hideOnMobile: true },
                  ].map((header) => (
                    <TableHead
                      key={header.label}
                      className={cn(
                        "text-2xs font-medium uppercase tracking-wider text-muted-foreground/50",
                        header.hideOnMobile && "hidden sm:table-cell",
                      )}
                    >
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="group cursor-pointer transition-all duration-150 hover:bg-card/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-secondary/80 text-2xs font-medium text-muted-foreground">
                            {contact.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-foreground">
                            {contact.name}
                          </p>
                          <p className="text-2xs text-muted-foreground/60">
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-foreground">
                        {contact.company}
                      </p>
                      <p className="text-2xs text-muted-foreground/60">
                        {contact.role}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            contact.status === "customer" && "bg-success",
                            contact.status === "prospect" && "bg-foreground/35",
                            contact.status === "lead" && "bg-foreground",
                            contact.status === "churned" && "bg-destructive/70",
                          )}
                        />
                        <span className="text-xs capitalize text-muted-foreground">
                          {contact.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center justify-between">
                        <span className="text-xs tabular-nums text-muted-foreground/60">
                          {getRelativeDate(contact.lastContact)}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground/0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground/30"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-muted-foreground/50">
                  No contacts found
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Backdrop — click outside panels to close */}
      {selectedContact && (
        <div
          className="fixed inset-0 z-40 bg-black/80 transition-opacity duration-300"
          style={{ animation: "overlayFadeIn 0.3s ease-out" }}
          onClick={() => setSelectedContact(null)}
        />
      )}

      {/* Chatbot panel — slides in from left when contact is selected */}
      {selectedContact && <CompanyChatbot contact={selectedContact} />}

      <ContactDetail
        contact={selectedContact}
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        onEdit={() => {
          setEditContact(selectedContact);
          setSelectedContact(null);
          setEditOpen(true);
        }}
        deals={deals}
        activities={activities}
        mobileIntel={
          selectedContact ? (
            <CompanyChatbot contact={selectedContact} embedded />
          ) : undefined
        }
      />

      <AddContactDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onContactAdded={onContactAdded}
      />
      <EditContactDialog
        contact={editContact}
        open={editOpen}
        onOpenChange={setEditOpen}
        onContactUpdated={onContactAdded}
      />
    </>
  );
}
