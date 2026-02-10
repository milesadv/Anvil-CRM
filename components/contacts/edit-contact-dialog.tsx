"use client";

import { useState, useEffect } from "react";
import type { Contact } from "@/lib/crm-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserClient } from "@/lib/supabase";

interface EditContactDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactUpdated: () => void;
}

export function EditContactDialog({
  contact,
  open,
  onOpenChange,
  onContactUpdated,
}: EditContactDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<
    "lead" | "prospect" | "customer" | "churned"
  >("lead");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (contact && open) {
      const parts = contact.name.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
      setEmail(contact.email);
      setPhone(contact.phone);
      setCompany(contact.company);
      setWebsite(contact.website || "");
      setRole(contact.role);
      setStatus(contact.status);
      setNotes(contact.notes || "");
    }
  }, [contact, open]);

  async function handleSubmit() {
    if (!contact) return;
    const name = `${firstName} ${lastName}`.trim();
    if (!name || !email) return;

    const supabase = createBrowserClient();
    const avatar = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    setSaving(true);
    const { error } = await supabase
      .from("contacts")
      .update({
        name,
        email,
        phone,
        company,
        website,
        role,
        status,
        avatar,
        notes,
        last_contact: new Date().toISOString().split("T")[0],
      })
      .eq("id", contact.id);
    setSaving(false);

    if (!error) {
      onOpenChange(false);
      onContactUpdated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-foreground">
            Edit contact
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="editFirstName"
                className="text-xs text-muted-foreground"
              >
                First name
              </Label>
              <Input
                id="editFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="editLastName"
                className="text-xs text-muted-foreground"
              >
                Last name
              </Label>
              <Input
                id="editLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="editEmail"
              className="text-xs text-muted-foreground"
            >
              Email
            </Label>
            <Input
              id="editEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="editPhone"
              className="text-xs text-muted-foreground"
            >
              Phone
            </Label>
            <Input
              id="editPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="editCompany"
              className="text-xs text-muted-foreground"
            >
              Company
            </Label>
            <Input
              id="editCompany"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="editWebsite"
              className="text-xs text-muted-foreground"
            >
              Website
            </Label>
            <Input
              id="editWebsite"
              type="url"
              placeholder="https://example.co.uk"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editRole" className="text-xs text-muted-foreground">
              Role
            </Label>
            <Input
              id="editRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="editNotes"
              className="text-xs text-muted-foreground"
            >
              Notes
            </Label>
            <Textarea
              id="editNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-border bg-transparent text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving || !firstName || !email}
            className="bg-foreground text-sm text-background hover:bg-foreground/90"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
