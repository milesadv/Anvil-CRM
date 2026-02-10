"use client"

import React, { useState, useEffect, useCallback } from "react"
import { CrmNav, type CrmView } from "./crm-nav"
import { PageHeader } from "./page-header"
import { StatCards } from "./dashboard/stat-cards"
import { PipelineChart } from "./dashboard/pipeline-chart"
import { RecentActivity } from "./dashboard/recent-activity"
import { UpcomingTasks } from "./dashboard/upcoming-tasks"
import { ContactsTable } from "./contacts/contacts-table"
import { PipelineBoard } from "./deals/pipeline-board"
import { ActivityList } from "./activities/activity-list"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"
import type { Contact, Deal, Activity } from "@/lib/crm-data"

function mapContact(row: Record<string, unknown>): Contact {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    company: row.company as string,
    role: row.role as string,
    phone: row.phone as string,
    status: row.status as Contact["status"],
    lastContact: row.last_contact as string,
    avatar: row.avatar as string,
    notes: (row.notes as string) ?? "",
  }
}

function mapDeal(row: Record<string, unknown>): Deal {
  return {
    id: row.id as string,
    title: row.title as string,
    amount: Number(row.amount) || 0,
    stage: row.stage as Deal["stage"],
    probability: row.probability as number,
    contactId: row.contact_id as string,
    expectedCloseDate: (row.expected_close_date as string) ?? null,
    createdAt: row.created_at as string,
  }
}

function mapActivity(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    type: row.type as Activity["type"],
    title: row.title as string,
    description: row.description as string,
    contactId: row.contact_id as string,
    dealId: (row.deal_id as string) ?? null,
    dueDate: (row.due_date as string) ?? null,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  }
}

export function CrmShell() {
  const [activeView, setActiveView] = useState<CrmView>("overview")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setContacts(data.map(mapContact))
  }, [])

  const fetchDeals = useCallback(async () => {
    const { data } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setDeals(data.map(mapDeal))
  }, [])

  const fetchActivities = useCallback(async () => {
    const { data } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setActivities(data.map(mapActivity))
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchContacts(), fetchDeals(), fetchActivities()])
    setLoading(false)
  }, [fetchContacts, fetchDeals, fetchActivities])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return (
    <div className="min-h-screen bg-background">
      <CrmNav activeView={activeView} onNavigate={setActiveView} />
      <main className="mx-auto max-w-6xl">
        {loading ? (
          <div className="px-4 pt-6 sm:px-6 sm:pt-8">
            <Skeleton className="h-6 w-28" />
            <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-3 h-8 w-32" />
                </div>
              ))}
            </div>
            <div className="mt-8 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {activeView === "overview" && (
              <>
                <PageHeader title="Overview" />
                <div className="flex flex-col px-4 pb-8 sm:px-6">
                  <StatCards contacts={contacts} deals={deals} />
                  <div className="mt-8 grid grid-cols-1 gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-2">
                    <PipelineChart deals={deals} />
                    <RecentActivity activities={activities} contacts={contacts} />
                  </div>
                  <div className="mt-8 sm:mt-10">
                    <UpcomingTasks activities={activities} contacts={contacts} />
                  </div>
                </div>
              </>
            )}
            {activeView === "contacts" && (
              <>
                <PageHeader title="Contacts" description="Manage your leads, prospects and customers" />
                <ContactsTable
                  contacts={contacts}
                  deals={deals}
                  activities={activities}
                  onContactAdded={refreshAll}
                />
              </>
            )}
            {activeView === "pipeline" && (
              <>
                <PageHeader title="Pipeline" description="Track deals through your sales process" />
                <PipelineBoard deals={deals} contacts={contacts} onDealAdded={refreshAll} />
              </>
            )}
            {activeView === "activity" && (
              <>
                <PageHeader title="Activity" description="Track calls, emails, meetings and tasks" />
                <ActivityList activities={activities} contacts={contacts} onActivityAdded={refreshAll} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
