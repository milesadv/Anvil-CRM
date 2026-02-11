"use client";

import { useState, useEffect } from "react";
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
import type { Deal, DealStage, Contact } from "@/lib/crm-data";
import { createBrowserClient } from "@/lib/supabase";

interface EditDealDialogProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Contact[];
  onDealUpdated: () => void;
}

export function EditDealDialog({
  deal,
  open,
  onOpenChange,
  contacts,
  onDealUpdated,
}: EditDealDialogProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [probability, setProbability] = useState("50");
  const [contactId, setContactId] = useState("");
  const [stage, setStage] = useState<DealStage>("discovery");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (deal && open) {
      setTitle(deal.title);
      setAmount(String(deal.amount));
      setProbability(String(deal.probability));
      setContactId(deal.contactId);
      setStage(deal.stage);
      setExpectedCloseDate(
        deal.expectedCloseDate
          ? deal.expectedCloseDate.split("T")[0]
          : "",
      );
    }
  }, [deal, open]);

  async function handleSubmit() {
    if (!deal || !title || !amount || !contactId) return;

    const supabase = createBrowserClient();

    setSaving(true);
    const { error } = await supabase
      .from("deals")
      .update({
        title,
        amount: parseFloat(amount),
        stage,
        probability: parseInt(probability, 10) || 50,
        contact_id: contactId,
        expected_close_date: expectedCloseDate || null,
      })
      .eq("id", deal.id);
    setSaving(false);

    if (!error) {
      onOpenChange(false);
      onDealUpdated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/60 bg-card sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-foreground">
            Edit deal
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3.5 py-2">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="editDealTitle"
              className="text-xs text-muted-foreground"
            >
              Title
            </Label>
            <Input
              id="editDealTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="editDealAmount"
                className="text-xs text-muted-foreground"
              >
                Amount ({"\u00A3"})
              </Label>
              <Input
                id="editDealAmount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="editProbability"
                className="text-xs text-muted-foreground"
              >
                Probability (%)
              </Label>
              <Input
                id="editProbability"
                type="number"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Contact</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} &mdash; {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Stage</Label>
            <Select
              value={stage}
              onValueChange={(v) => setStage(v as DealStage)}
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
              htmlFor="editExpectedCloseDate"
              className="text-xs text-muted-foreground"
            >
              Expected close
            </Label>
            <Input
              id="editExpectedCloseDate"
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="h-9 text-sm"
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
            disabled={saving || !title || !amount || !contactId}
            className="bg-foreground text-sm text-background hover:bg-foreground/90"
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
