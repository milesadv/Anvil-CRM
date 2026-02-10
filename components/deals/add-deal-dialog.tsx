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
import type { Contact } from "@/lib/crm-data"
import { supabase } from "@/lib/supabase"

interface AddDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: Contact[]
  onDealAdded: () => void
}

export function AddDealDialog({ open, onOpenChange, contacts, onDealAdded }: AddDealDialogProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [probability, setProbability] = useState("50")
  const [contactId, setContactId] = useState("")
  const [stage, setStage] = useState<"prospecting" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost">("prospecting")
  const [expectedCloseDate, setExpectedCloseDate] = useState("")
  const [saving, setSaving] = useState(false)

  function reset() {
    setTitle("")
    setAmount("")
    setProbability("50")
    setContactId("")
    setStage("prospecting")
    setExpectedCloseDate("")
  }

  async function handleSubmit() {
    if (!title || !amount || !contactId) return

    setSaving(true)
    const { error } = await supabase.from("deals").insert({
      title,
      amount: parseFloat(amount),
      stage,
      probability: parseInt(probability, 10) || 50,
      contact_id: contactId,
      expected_close_date: expectedCloseDate || null,
    })
    setSaving(false)

    if (!error) {
      reset()
      onOpenChange(false)
      onDealAdded()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium text-foreground">New deal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dealTitle" className="text-[11px] text-muted-foreground">
              Title
            </Label>
            <Input
              id="dealTitle"
              placeholder="Enterprise licence"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dealAmount" className="text-[11px] text-muted-foreground">
                {"Amount (\u00A3)"}
              </Label>
              <Input
                id="dealAmount"
                type="number"
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="probability" className="text-[11px] text-muted-foreground">
                Probability (%)
              </Label>
              <Input
                id="probability"
                type="number"
                placeholder="50"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Contact</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger className="h-9 border-border bg-secondary text-[13px] text-foreground">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                {contacts.length > 0 ? (
                  contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} -- {c.company}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No contacts available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Stage</Label>
            <Select value={stage} onValueChange={(v) => setStage(v as typeof stage)}>
              <SelectTrigger className="h-9 border-border bg-secondary text-[13px] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem value="prospecting">Prospecting</SelectItem>
                <SelectItem value="qualification">Qualification</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expectedCloseDate" className="text-[11px] text-muted-foreground">
              Expected close
            </Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="h-9 border-border bg-secondary text-[13px] text-foreground"
            />
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
            disabled={saving || !title || !amount || !contactId}
            className="bg-foreground text-[12px] text-background hover:bg-foreground/90"
          >
            {saving ? "Creating..." : "Create deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
