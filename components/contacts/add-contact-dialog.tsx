"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

interface AddContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContactAdded: () => void
}

export function AddContactDialog({ open, onOpenChange, onContactAdded }: AddContactDialogProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState<"lead" | "prospect" | "customer" | "churned">("lead")
  const [saving, setSaving] = useState(false)

  function reset() {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setCompany("")
    setRole("")
    setStatus("lead")
  }

  async function handleSubmit() {
    const name = `${firstName} ${lastName}`.trim()
    if (!name || !email) return

    const avatar = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

    setSaving(true)
    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      phone,
      company,
      role,
      status,
      avatar,
      last_contact: new Date().toISOString().split("T")[0],
    })
    setSaving(false)

    if (!error) {
      reset()
      onOpenChange(false)
      onContactAdded()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium text-foreground">New contact</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-[11px] text-muted-foreground">First name</Label>
              <Input id="firstName" placeholder="Sarah" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="text-[11px] text-muted-foreground">Last name</Label>
              <Input id="lastName" placeholder="Chen" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[11px] text-muted-foreground">Email</Label>
            <Input id="email" type="email" placeholder="sarah@example.co.uk" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone" className="text-[11px] text-muted-foreground">Phone</Label>
            <Input id="phone" type="tel" placeholder="+44 7911 123456" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company" className="text-[11px] text-muted-foreground">Company</Label>
            <Input id="company" placeholder="Acme Ltd" value={company} onChange={(e) => setCompany(e.target.value)} className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role" className="text-[11px] text-muted-foreground">Role</Label>
            <Input id="role" placeholder="VP of Engineering" value={role} onChange={(e) => setRole(e.target.value)} className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-9 border-border bg-secondary text-[13px] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-border bg-transparent text-[12px] text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving || !firstName || !email}
            className="bg-foreground text-[12px] text-background hover:bg-foreground/90"
          >
            {saving ? "Adding..." : "Add contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
