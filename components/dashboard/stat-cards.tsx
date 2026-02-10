import { formatCurrency } from "@/lib/crm-data"
import type { Contact, Deal } from "@/lib/crm-data"

interface StatCardsProps {
  contacts: Contact[]
  deals: Deal[]
}

export function StatCards({ contacts, deals }: StatCardsProps) {
  const totalPipeline = deals
    .filter((d) => d.stage !== "closing")
    .reduce((sum, d) => sum + d.amount, 0)

  const closedRevenue = deals
    .filter((d) => d.stage === "closing")
    .reduce((sum, d) => sum + d.amount, 0)

  const activeDeals = deals.filter((d) => d.stage !== "closing").length
  const totalContacts = contacts.length

  const stats = [
    { label: "Pipeline value", value: formatCurrency(totalPipeline) },
    { label: "Closed revenue", value: formatCurrency(closedRevenue) },
    { label: "Active deals", value: activeDeals.toString() },
    { label: "Contacts", value: totalContacts.toString() },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border/60 bg-card/50 px-4 py-4 sm:px-5 sm:py-5"
        >
          <p className="text-xs text-muted-foreground">{stat.label}</p>
          <p className="mt-2.5 text-2xl font-normal tabular-nums leading-none tracking-tight text-foreground sm:text-3xl">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
