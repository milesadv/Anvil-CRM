"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Contact, Deal, Activity } from "@/lib/crm-data";
import { formatCurrency, getRelativeDate, stageLabels } from "@/lib/crm-data";
import { cn } from "@/lib/utils";

type MobileTab = "details" | "intel";

interface ContactDetailProps {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  deals: Deal[];
  activities: Activity[];
  /** Chatbot element rendered inside the panel on mobile */
  mobileIntel?: ReactNode;
}

export function ContactDetail({
  contact,
  open,
  onClose,
  onEdit,
  deals,
  activities,
  mobileIntel,
}: ContactDetailProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("details");

  const contactDeals = contact
    ? deals.filter((d) => d.contactId === contact.id)
    : [];
  const contactActivities = contact
    ? activities.filter((a) => a.contactId === contact.id)
    : [];

  // Reset tab when contact changes
  useEffect(() => {
    setMobileTab("details");
  }, [contact?.id]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !contact) return null;

  const hasWebsite = !!contact.website;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:p-3 sm:pl-0"
      style={{
        animation: "panelSlideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-1 flex-col overflow-hidden bg-[hsl(0_0%_6%)] sm:rounded-2xl sm:border sm:border-white/[0.06] sm:bg-[hsl(0_0%_6%/0.95)] sm:backdrop-blur-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
          <p className="text-xs uppercase tracking-[0.15em] text-white/25">
            Contact
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/20 transition-all duration-200 hover:bg-white/[0.05] hover:text-white/50"
          >
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
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile tabs — only show when chatbot content is available */}
        {hasWebsite && mobileIntel && (
          <div className="flex gap-0 px-5 pt-4 sm:hidden">
            <div className="flex w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
              {(
                [
                  { id: "details", label: "Details" },
                  { id: "intel", label: "Intel" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMobileTab(tab.id)}
                  className={cn(
                    "flex-1 rounded-md py-2 text-xs font-medium transition-all duration-200",
                    mobileTab === tab.id
                      ? "bg-white/[0.08] text-white/70 shadow-sm"
                      : "text-white/25 hover:text-white/40",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content area — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Details tab (always visible on desktop, toggled on mobile) */}
          <div className={cn(mobileTab !== "details" && "hidden sm:block")}>
            {/* Name */}
            <div className="px-5 pt-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-sm font-medium text-white/45">
                  {contact.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white/90">
                    {contact.name}
                  </h3>
                  <p className="text-sm text-white/30">{contact.role}</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 px-5 sm:px-7">
              <div className="space-y-0">
                {[
                  { label: "Email", value: contact.email, link: false },
                  { label: "Phone", value: contact.phone, link: false },
                  { label: "Website", value: contact.website, link: true },
                  { label: "LinkedIn", value: contact.linkedin, link: true },
                  { label: "Company", value: contact.company, link: false },
                ]
                  .filter((item) => item.value)
                  .map((item) => (
                    <div
                      key={item.label}
                      className="flex items-baseline justify-between border-b border-white/[0.04] py-3"
                    >
                      <span className="text-xs uppercase tracking-[0.1em] text-white/20">
                        {item.label}
                      </span>
                      {item.link ? (
                        <a
                          href={
                            item.value.startsWith("http")
                              ? item.value
                              : `https://${item.value}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/50 transition-colors hover:text-white/70"
                        >
                          {item.value.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-sm text-white/60">
                          {item.value}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Notes */}
            {contact.notes && (
              <div className="mt-5 px-5 sm:px-7">
                <p className="text-xs uppercase tracking-[0.1em] text-white/20">
                  Notes
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/30">
                  {contact.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex gap-2 px-5 sm:px-7">
              {[
                {
                  label: "Email",
                  href: `mailto:${contact.email}`,
                  tag: "a" as const,
                },
                {
                  label: "Call",
                  href: `tel:${contact.phone}`,
                  tag: "a" as const,
                },
                ...(contact.linkedin
                  ? [
                      {
                        label: "LinkedIn",
                        href: contact.linkedin.startsWith("http")
                          ? contact.linkedin
                          : `https://${contact.linkedin}`,
                        tag: "a" as const,
                        external: true,
                      },
                    ]
                  : []),
                { label: "Edit", onClick: onEdit, tag: "button" as const },
              ].map((action) =>
                action.tag === "a" ? (
                  <a
                    key={action.label}
                    href={action.href}
                    {...("external" in action && action.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex-1 rounded-lg border border-white/[0.06] py-2.5 text-center text-sm font-medium text-white/40 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white/65"
                  >
                    {action.label}
                  </a>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="flex-1 rounded-lg border border-white/[0.06] py-2.5 text-center text-sm font-medium text-white/40 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white/65"
                  >
                    {action.label}
                  </button>
                ),
              )}
            </div>

            {/* Deals */}
            <div className="mt-8 px-5 sm:px-7">
              <div className="flex items-baseline justify-between">
                <p className="text-xs uppercase tracking-[0.1em] text-white/20">
                  Deals
                </p>
                <span className="text-xs tabular-nums text-white/12">
                  {contactDeals.length}
                </span>
              </div>
              <div className="mt-3">
                {contactDeals.length > 0 ? (
                  contactDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between border-b border-white/[0.03] py-3"
                    >
                      <div>
                        <p className="text-sm text-white/50">{deal.title}</p>
                        <p className="text-xs text-white/20">
                          {stageLabels[deal.stage]}
                        </p>
                      </div>
                      <span className="text-sm tabular-nums font-medium text-white/55">
                        {formatCurrency(deal.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-5 text-center text-sm text-white/12">
                    No deals yet
                  </p>
                )}
              </div>
            </div>

            {/* Activities */}
            <div className="mt-6 px-5 pb-7 sm:px-7">
              <div className="flex items-baseline justify-between">
                <p className="text-xs uppercase tracking-[0.1em] text-white/20">
                  Activity
                </p>
                <span className="text-xs tabular-nums text-white/12">
                  {contactActivities.length}
                </span>
              </div>
              <div className="mt-3">
                {contactActivities.length > 0 ? (
                  contactActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border-b border-white/[0.03] py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-12 text-xs capitalize text-white/25">
                          {activity.type}
                        </span>
                        <p className="text-sm text-white/50">
                          {activity.title}
                        </p>
                      </div>
                      <span className="text-xs tabular-nums text-white/20">
                        {getRelativeDate(activity.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-5 text-center text-sm text-white/12">
                    No activity yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Intel tab — mobile only (desktop uses the separate chatbot panel) */}
          {mobileTab === "intel" && mobileIntel && (
            <div className="flex flex-1 flex-col sm:hidden">{mobileIntel}</div>
          )}
        </div>
      </div>
    </div>
  );
}
