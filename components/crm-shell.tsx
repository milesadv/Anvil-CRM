"use client"

import React, { useState } from "react"
import { CrmNav, type CrmView } from "./crm-sidebar"
import { PageHeader } from "./page-header"
import { StatCards } from "./dashboard/stat-cards"
import { PipelineChart } from "./dashboard/pipeline-chart"
import { RecentActivity } from "./dashboard/recent-activity"
import { UpcomingTasks } from "./dashboard/upcoming-tasks"
import { ContactsTable } from "./contacts/contacts-table"
import { PipelineBoard } from "./deals/pipeline-board"
import { ActivityList } from "./activities/activity-list"
import type { Contact, Deal, Activity } from "@/lib/crm-data"

export function CrmShell() {
  const [activeView, setActiveView] = useState<CrmView>("overview")

  // These will be populated from Supabase once connected
  const contacts: Contact[] = []
  const deals: Deal[] = []
  const activities: Activity[] = []

  return (
    <div className="min-h-screen bg-background">
      <CrmNav activeView={activeView} onNavigate={setActiveView} />
      <main className="mx-auto max-w-6xl">
        {activeView === "overview" && (
          <>
            <PageHeader title="Overview" />
            <div className="flex flex-col gap-px px-6 pb-8">
              <StatCards contacts={contacts} deals={deals} />
              <div className="mt-6 grid grid-cols-2 gap-6">
                <PipelineChart deals={deals} />
                <RecentActivity activities={activities} />
              </div>
              <div className="mt-6">
                <UpcomingTasks activities={activities} />
              </div>
            </div>
          </>
        )}
        {activeView === "contacts" && (
          <>
            <PageHeader title="Contacts" description="Manage your leads, prospects and customers" />
            <ContactsTable contacts={contacts} deals={deals} activities={activities} />
          </>
        )}
        {activeView === "pipeline" && (
          <>
            <PageHeader title="Pipeline" description="Track deals through your sales process" />
            <PipelineBoard deals={deals} contacts={contacts} />
          </>
        )}
        {activeView === "activity" && (
          <>
            <PageHeader title="Activity" description="Track calls, emails, meetings and tasks" />
            <ActivityList activities={activities} contacts={contacts} />
          </>
        )}
      </main>
    </div>
  )
}
