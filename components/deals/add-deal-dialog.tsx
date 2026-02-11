"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Contact } from "@/lib/crm-data";
import { createBrowserClient } from "@/lib/supabase";

interface AddDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  onDealAdded: () => void;
}

export function AddDealDialog({
  open,
  onOpenChange,
  contacts,
  onDealAdded,
}: AddDealDialogProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [probability, setProbability] = useState("50");
  const [contactId, setContactId] = useState("");
  const [stage, setStage] = useState<
    "discovery" | "pricing" | "negotiating" | "closing"
  >("discovery");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setTitle("");
    setAmount("");
    setProbability("50");
    setContactId("");
    setStage("discovery");
    setExpectedCloseDate("");
  }

  async function handleSubmit() {
    if (!title || !amount || !contactId) return;

    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    const { error } = await supabase.from("deals").insert({
      user_id: user.id,
      title,
      amount: parseFloat(amount),
      stage,
      probability: parseInt(probability, 10) || 50,
      contact_id: contactId,
      expected_close_date: expectedCloseDate || null,
    });
    setSaving(false);

    if (!error) {
      reset();
      onOpenChange(false);
      onDealAdded();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/60 bg-card sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-foreground">
            New deal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Deal info */}
          <fieldset className="space-y-3">
            <legend className="text-2xs font-medium uppercase tracking-wider text-muted-foreground/50">
              Deal info
            </legend>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="dealTitle"
                className="text-xs text-muted-foreground"
              >
                Title
              </Label>
              <Input
                id="dealTitle"
                placeholder="Enterprise licence"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.length > 0 ? (
                    contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} &mdash; {c.company}
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
          </fieldset>

          <div className="border-t border-border/30" />

          {/* Financials */}
          <fieldset className="space-y-3">
            <legend className="text-2xs font-medium uppercase tracking-wider text-muted-foreground/50">
              Financials
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="dealAmount"
                  className="text-xs text-muted-foreground"
                >
                  Amount ({"\u00A3"})
                </Label>
                <Input
                  id="dealAmount"
                  type="number"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="probability"
                  className="text-xs text-muted-foreground"
                >
                  Probability (%)
                </Label>
                <Input
                  id="probability"
                  type="number"
                  placeholder="50"
                  value={probability}
                  onChange={(e) => setProbability(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </fieldset>

          <div className="border-t border-border/30" />

          {/* Pipeline */}
          <fieldset className="space-y-3">
            <legend className="text-2xs font-medium uppercase tracking-wider text-muted-foreground/50">
              Pipeline
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Stage</Label>
                <Select
                  value={stage}
                  onValueChange={(v) => setStage(v as typeof stage)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="pricing">Pricing</SelectItem>
                    <SelectItem value="negotiating">Negotiating</SelectItem>
                    <SelectItem value="closing">Closing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="expectedCloseDate"
                  className="text-xs text-muted-foreground"
                >
                  Expected close
                </Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </fieldset>
        </div>

        <DialogFooter className="gap-2 pt-1">
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
            disabled={saving || !title || !amount || !contactId}
            className="bg-foreground text-sm text-background hover:bg-foreground/90"
          >
            {saving ? "Creating..." : "Create deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
