import { formatCurrency } from "@/lib/crm-data"
import type { Contact, Deal } from "@/lib/crm-data"

interface StatCardsProps {
  contacts: Contact[]
  deals: Deal[]
}

export function StatCards({ contacts, deals }: StatCardsProps) {
  const totalPipeline = deals
    .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .reduce((sum, d) => sum + d.amount, 0)

  const closedRevenue = deals
    .filter((d) => d.stage === "closed_won")
    .reduce((sum, d) => sum + d.amount, 0)

  const activeDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost").length
  const totalContacts = contacts.length

  const stats = [
    { label: "Pipeline value", value: formatCurrency(totalPipeline) },
    { label: "Closed revenue", value: formatCurrency(closedRevenue) },
    { label: "Active deals", value: activeDeals.toString() },
    { label: "Contacts", value: totalContacts.toString() },
  ]

  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-[12px] text-muted-foreground">{stat.label}</p>
          <p className="mt-2 text-[32px] font-light tabular-nums leading-none tracking-tight text-foreground">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
