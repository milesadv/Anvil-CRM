# Anvil CRM -- Supabase Integration

This project is a frontend-only CRM application. It needs a Supabase backend to persist data and become fully functional.

## What needs connecting

The CRM shell (`components/crm-shell.tsx`) currently passes empty arrays for `contacts`, `deals`, and `activities`. These need to be replaced with data fetched from Supabase.

## Data types

All TypeScript types are defined in `lib/crm-data.ts`. The Supabase schema should match these interfaces:

### contacts table

| Column        | Type   | Notes                                          |
| ------------- | ------ | ---------------------------------------------- |
| id            | uuid   | Primary key, default `gen_random_uuid()`       |
| name          | text   | Full name                                      |
| email         | text   | Email address                                  |
| company       | text   | Company name                                   |
| role          | text   | Job title / role                               |
| phone         | text   | UK format, e.g. +44 7911 123456                |
| status        | text   | One of: lead, prospect, customer, churned      |
| last_contact  | date   | Date of last interaction                        |
| avatar        | text   | Two-letter initials, e.g. "SC"                 |
| created_at    | timestamptz | Default `now()`                            |

### deals table

| Column         | Type    | Notes                                         |
| -------------- | ------- | --------------------------------------------- |
| id             | uuid    | Primary key, default `gen_random_uuid()`      |
| title          | text    | Deal name                                     |
| company        | text    | Company name                                  |
| value          | integer | Value in GBP (pence or whole pounds)          |
| stage          | text    | One of: discovery-call, pricing, negotiation, closed |
| probability    | integer | 0-100                                         |
| contact_id     | uuid    | Foreign key to contacts.id                    |
| contact_name   | text    | Denormalised contact name for display          |
| expected_close | date    | Expected close date                            |
| created_at     | timestamptz | Default `now()`                           |

### activities table

| Column       | Type    | Notes                                          |
| ------------ | ------- | ---------------------------------------------- |
| id           | uuid    | Primary key, default `gen_random_uuid()`       |
| type         | text    | One of: call, email, meeting, note, task       |
| title        | text    | Activity title                                 |
| description  | text    | Longer description                             |
| contact_name | text    | Denormalised contact name for display           |
| contact_id   | uuid    | Foreign key to contacts.id                     |
| date         | date    | Activity date                                  |
| completed    | boolean | Default false                                  |
| created_at   | timestamptz | Default `now()`                            |

## Integration points

1. **`components/crm-shell.tsx`** -- Replace the empty arrays with Supabase queries. This is the single source of truth for all data in the app.

2. **`components/contacts/add-contact-dialog.tsx`** -- Wire the form submission to insert into `contacts` table.

3. **`components/deals/add-deal-dialog.tsx`** -- Wire the form submission to insert into `deals` table. The contact select dropdown already receives contacts as a prop.

4. **`components/activities/add-activity-dialog.tsx`** -- Wire the form submission to insert into `activities` table.

## Environment variables needed

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Utility functions

`lib/crm-data.ts` contains helper functions that are already used throughout the UI:

- `formatCurrency(value)` -- Formats numbers as GBP (e.g. "£68,000")
- `formatDate(dateStr)` -- Formats dates in en-GB locale (e.g. "15 Mar 2026")
- `getRelativeDate(dateStr)` -- Returns relative strings (e.g. "2 days ago", "Today")
- `stageLabels` -- Maps stage keys to display labels

## Pipeline stages

The sales pipeline has four stages reflecting the actual sales process:

1. **Discovery Call** -- Booking and completing the initial discovery call
2. **Pricing** -- Putting a price to the job after discovery
3. **Negotiation** -- Negotiating terms and finalising
4. **Closed** -- Deal closed

## Notes

- All currency is GBP (pounds sterling)
- All dates use en-GB formatting
- Phone numbers are in UK format (+44)
- The app uses British English throughout
- No authentication is implemented yet -- consider adding Supabase Auth if multiple users are needed
- Row Level Security (RLS) should be configured on all tables once auth is in place
