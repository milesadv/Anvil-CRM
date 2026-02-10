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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Contact } from "@/lib/crm-data"

interface AddDealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: Contact[]
}

export function AddDealDialog({ open, onOpenChange, contacts }: AddDealDialogProps) {
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
              className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dealValue" className="text-[11px] text-muted-foreground">
                {"Value (\u00A3)"}
              </Label>
              <Input
                id="dealValue"
                type="number"
                placeholder="50000"
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
                className="h-9 border-border bg-secondary text-[13px] text-foreground placeholder:text-muted-foreground"
              />
            </div>
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
            <Select defaultValue="discovery-call">
              <SelectTrigger className="h-9 border-border bg-secondary text-[13px] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-card text-foreground">
                <SelectItem value="discovery-call">Discovery Call</SelectItem>
                <SelectItem value="pricing">Pricing</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expectedClose" className="text-[11px] text-muted-foreground">
              Expected close
            </Label>
            <Input
              id="expectedClose"
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
            Create deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
