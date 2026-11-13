# Sacrament Meeting Planner

WDD 430 Weeks 02–03 assignment by Thubelihle Dlamini. A Next.js (App Router) app that helps bishoprics plan sacrament meeting agendas and lets members view and print the program for the current or any past week.

## Routes

Pages are organized with route groups. The folder names in parentheses don't appear in URLs.

| Route | Folder | Description |
| --- | --- | --- |
| `/` | `app/page.tsx` | Landing page |
| `/meetings` | `app/(public)/meetings` | Meetings, newest first, with search (`?query=`) and pagination (`?page=`, 5 per page) |
| `/meetings/[id]` | `app/(public)/meetings/[id]` | Full program for one meeting, with a print button |
| `/meetings/current` | `app/(public)/meetings/current` | Redirects to the most recent Sunday's meeting, or to `/meetings` if none is planned |
| `/meetings/new` | `app/(admin)/meetings/new` | Create form placeholder (Week 04) |
| `/meetings/[id]/edit` | `app/(admin)/meetings/[id]/edit` | Edit form placeholder (Week 04) |

The search matches the presiding or conducting leader, the meeting type, and speaker names or topics. Search and page live in the URL, so results survive a refresh, can be shared, and work with the back button.

## API

| Method & path | Response |
| --- | --- |
| `GET /api/meetings` | `200` with the first page of meetings; supports `?query=` and `?page=` (`400` for an invalid page) |
| `GET /api/meetings?date=YYYY-MM-DD` | `200` with meetings on that date; `400` if the date is not a real date |
| `GET /api/meetings/[id]` | `200` with the meeting; `400` if the id is not a positive whole number; `404` if not found |

## Database

Meetings are stored in a Neon PostgreSQL database connected through Vercel (Storage → Neon).

- `db/schema.sql` creates the `meetings` table; `db/seed.sql` inserts 12 meetings. Run both in Vercel → Storage → your database → Query.
- `lib/meetings-db.ts` queries it with `@neondatabase/serverless`. Every query uses the `sql` tagged template, so values are sent as parameters and can't inject SQL. Column aliases turn snake_case columns into the camelCase `SacramentMeeting` type.
- `addMeeting`, `updateMeeting` and `deleteMeeting` are stubs until Week 04.

## Project structure

- `lib/types.ts`: `SacramentMeeting`, `Hymn`, `SpeakerItem`, `WardBusinessItem`, `MeetingType`
- `lib/meetings-db.ts`: database queries (`getMeetings`, `getMeetingsTotalPages`, `getMeetingById`, `getMeetingsByDate`)
- `lib/meeting-utils.ts`: date formatting, "most recent Sunday", meeting-type labels
- `components/`: `Header`, `Footer`, `NavLinks`, `MeetingSearch` (debounced, URL-based search), `Pagination`, `MeetingCard`, `MeetingDetail`, `MeetingTypeBadge`, `PrintButton`, `CurrentDate`

## Run locally

```bash
npm install
vercel link                 # once, to connect this folder to the Vercel project
vercel env pull .env.local  # downloads DATABASE_URL (never commit .env.local)
npm run dev
```

Open http://localhost:3000.
