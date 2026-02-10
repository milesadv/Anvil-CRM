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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Contact } from "@/lib/crm-data"
import { supabase } from "@/lib/supabase"

interface AddActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: Contact[]
  onActivityAdded: () => void
}

export function AddActivityDialog({ open, onOpenChange, contacts, onActivityAdded }: AddActivityDialogProps) {
  const [type, setType] = useState<"call" | "email" | "meeting" | "note" | "task">("call")
  const [title, setTitle] = useState("")
  const [contactId, setContactId] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [saving, setSaving] = useState(false)

  function reset() {
    setType("call")
    setTitle("")
    setContactId("")
    setDescription("")
    setDueDate("")
  }

  async function handleSubmit() {
    if (!title || !contactId) return

    setSaving(true)
    const { error } = await supabase.from("activities").insert({
      type,
      title,
      description,
      contact_id: contactId,
      due_date: dueDate || null,
    })
    setSaving(false)

    if (!error) {
      reset()
      onOpenChange(false)
      onActivityAdded()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium text-foreground">
            Log activity
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
              <SelectTrigger className="h-9 border-border bg-secondary text-[13px] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="activityTitle" className="text-[11px] text-muted-foreground">
              Title
            </Label>
            <Input
              id="activityTitle"
              placeholder="Follow-up call"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
            />
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
                      {c.name}
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
            <Label htmlFor="activityDesc" className="text-[11px] text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="activityDesc"
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="activityDueDate" className="text-[11px] text-muted-foreground">
              Due date
            </Label>
            <Input
              id="activityDueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
            disabled={saving || !title || !contactId}
            className="bg-foreground text-[12px] text-background hover:bg-foreground/90"
          >
            {saving ? "Logging..." : "Log activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
