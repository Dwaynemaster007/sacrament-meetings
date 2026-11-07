# Sacrament Meeting Planner

WDD 430 Week 02 assignment by Thubelihle Dlamini. A Next.js (App Router) app that helps bishoprics plan sacrament meeting agendas and lets members view and print the program for the current or any past week.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/meetings` | All meetings, newest first (fetched from `/api/meetings`) |
| `/meetings/[id]` | Full program for one meeting, with a print button (fetched from `/api/meetings/[id]`) |
| `/meetings/current` | Redirects to the most recent Sunday's meeting, or to `/meetings` if none is planned |

## API

| Method & path | Response |
| --- | --- |
| `GET /api/meetings` | `200` with all meetings |
| `GET /api/meetings?date=YYYY-MM-DD` | `200` with meetings on that date; `400` if the date is malformed |
| `GET /api/meetings/[id]` | `200` with the meeting; `400` if the id is not a positive whole number; `404` if not found |

## Project structure

- `lib/types.ts`: `SacramentMeeting`, `Hymn`, `SpeakerItem`, `WardBusinessItem`, `MeetingType`
- `lib/meetings-db.ts`: temporary in-memory data (10 meetings) with `getMeetings()` and `getMeetingById()`
- `lib/api.ts`: typed fetch helpers that Server Components use to call the API routes
- `lib/meeting-utils.ts`: date formatting, "most recent Sunday", meeting-type labels
- `components/`: `Header`, `Footer`, `NavLinks` (Client Component, active links via `usePathname`), `MeetingCard`, `MeetingDetail`, `MeetingTypeBadge`, `PrintButton` (Client Component), `CurrentDate`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
