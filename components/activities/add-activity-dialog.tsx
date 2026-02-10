"use client"

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

interface AddActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: Contact[]
}

export function AddActivityDialog({ open, onOpenChange, contacts }: AddActivityDialogProps) {
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
            <Select defaultValue="call">
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
              className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-muted-foreground">Contact</Label>
            <Select>
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
              className="min-h-[80px] border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="activityDate" className="text-[11px] text-muted-foreground">
              Date
            </Label>
            <Input
              id="activityDate"
              type="date"
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
            onClick={() => onOpenChange(false)}
            className="bg-foreground text-[12px] text-background hover:bg-foreground/90"
          >
            Log activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
