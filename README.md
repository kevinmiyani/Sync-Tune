# Sync Tune

## Project Overview
Sync Tune is a dual Next.js frontend and Socket.IO/Express backend that lets a host and members experience synchronized YouTube playlists. Hosts manage tracks and playback while members join rooms to listen in real-time, optionally contributing playlists or syncing their view with the host. The app solves the challenge of coordinating shared listening sessions for groups who are remote or distributed, offering immediate real-time updates and simple sharing links without requiring installation.

## Tech Stack
- **Frontend (sync-tune-ui-main):** Next.js 15, React 19, Tailwind CSS, Radix UI, Framer Motion, Socket.IO client, YouTube Player API
- **Backend (sync-tune-api-main):** Node.js (Express 5), Socket.IO server, dotenv
- **Database:** In-memory room registry with JSON snapshots persisted under `sync-tune-api-main/logs/rooms`
- **Third-party services:** YouTube Data API v3 (playlist ingestion), optional Firebase analytics placeholder
- **DevOps / tooling:** npm, nodemon (backend dev), Next.js scripts

## Architecture Overview
- **FE ↔ BE communication:** The frontend establishes a Socket.IO connection (`NEXT_PUBLIC_SOCKET_URL`) and emits events for room creation, joining, playlist updates, volume changes, and sync requests. The backend broadcasts state changes to sockets scoped by room.
- **API-based architecture:** Backend exposes a `GET /ping` health endpoint; all stateful interactions happen through named Socket.IO events, aligning to an event-driven API surface.
- **Authentication flow:** Roles are chosen client-side (host vs. member). Hosts claim room ownership with `create-room`, and members join via room ID. Permission flags determine what each member may do.
- **Data flow:** The backend stores each room in memory (`rooms[roomId]`), persists snapshots, and emits updates (`room-tracks`, `update-playing-status`, etc.) whenever hosts/members mutate the playlist or playback state.

## FRONTEND (FE)

### Frontend Overview
The frontend is a responsive single-page Next.js (app router) UI that allows users to choose a role, connect to the backend, and manage synchronized playback. It is a web application optimized for desktop and tablet interfaces.

### Frontend Tech Stack
- **Frameworks & libraries:** Next.js 15, React 19, Socket.IO client, Radix UI, Framer Motion, `youtube-player`, Tailwind CSS
- **State management:** React context (`AppContext`) holds the socket reference and connection status while individual components manage playlist, playback, and volume state via hooks.
- **Navigation / routing:** App router with one primary route; role selection and member invite links use query parameters (e.g., `?memberId=ROOM_ID`).
- **Styling solution:** Tailwind CSS + design-system primitives in `components/ui/`; `clsx` + `tailwind-merge` helpers (`lib/utils.ts`) simplify responsive classes.

### Frontend Folder Structure
- `app/` – Next.js layout, global styles, root `page.tsx`
- `components/page/` – Host, member, and new-track feature components
- `components/ui/` – Shared UI primitives (buttons, cards, sliders, popovers, etc.)
- `context/` – `AppContext` socket provider
- `hooks/` – Reusable hooks (mobile detection, toast helpers)
- `lib/` – Utility helpers (`utils.ts`, `type.ts`, Firebase placeholder)

### Key Frontend Features
- **Authentication:** Role selection is handled locally with dedicated Host/Member experiences.
- **API integration:** Socket.IO events connect to the backend; YouTube Data API fetches playlist tracks when adding playlists.
- **State management:** Local state keeps tracks, current index, and permissions in sync with server broadcasts.
- **Error handling:** Toasts report connection issues or invalid room states; loaders guard against initial socket latency.
- **Performance optimizations:** Reorder handles playlist reordering; periodic `/ping` keep-alive maintains backend availability.

### Frontend Setup & Installation
- **Prerequisites:** Node.js 20+, npm 10+, YouTube Data API key for playlist imports
- **Environment variables:** Refer to [Environment Variables](#environment-variables)
- **Installation:**
  ```bash
  cd /Users/kevin/Desktop/Github/Sync-Tune/sync-tune-ui-main
  npm install
  ```
- **Run locally:** `npm run dev` (starts Next.js on port 6001); ensure `NEXT_PUBLIC_SOCKET_URL` targets the backend.

### Frontend Scripts
- `npm run dev` – run in development mode (`-p 6001`)
- `npm run build` – build production assets
- `npm run start` – serve production build
- `npm run lint` – run linting

## BACKEND (BE)

### Backend Overview
The backend powers room orchestration: it tracks playlists, permissions, playback status, and handles Socket.IO messaging. It persists snapshots of each room to disk so reconnections can recover state.

### Backend Tech Stack
- **Runtime / framework:** Node.js (Express 5)
- **Database:** In-memory object maps with JSON dumps (`rooms`, `owners`, `members`)
- **Authentication:** Room ownership via the host socket; no JWTs or external identity providers
- **ORM / query builder:** None (plain JS data structures)
- **Validation & security:** Guards against missing rooms/hosts, ensures CORS allows frontend origins

### Backend Folder Structure
- `index.js` – Express server setup, Socket.IO handlers, persistence helpers
- `logs/rooms/` – persisted room states (`roomId.json`)
- `package.json` & `nodemon.json` – scripts (`start`, `dev`) and dev tooling

### API Design
- **Socket events:**
  - `connect-server` / `connected-server` – handshake
  - `create-room` – host initializes a room and broadcasts metadata
  - `join-room` – member joins, receives playlist and permissions
  - `add-track`, `update-tracks`, `update-current-playing`, `update-playing-status`, `update-volume` – sync playlist/playback/volume
  - `sync-request` / `sync-response` – alignment handshake for members
- **REST endpoint:**
  - `GET /ping` – simple health check used by the frontend keep-alive ping

### Authentication & Authorization
- **Flow:** Host calls `create-room` to claim ownership; members use `join-room` with the shared ID
- **Token handling:** None – authorization is implicit via socket IDs and room permissions
- **Role controls:** `allowMemberToPlay`, `allowMemberControlVolume`, `allowMemberToSync` gate member actions

### Backend Setup & Installation
- **Prerequisites:** Node.js 20+, npm 10+
- **Environment variables:** See [Environment Variables](#environment-variables)
- **Installation:**
  ```bash
  cd /Users/kevin/Desktop/Github/Sync-Tune/sync-tune-api-main
  npm install
  ```
- **Run locally:** `npm run dev` (nodemon watches `index.js`); backend listens on `PORT` (default `3000`)

## DATABASE

### Database Design
- **Type:** In-memory state persisted to disk snapshots (`logs/rooms/*.json`)
- **Entities:** `rooms` store playlists, playback metadata, permissions; `owners` & `members` map socket IDs to rooms
- **Relationships:** Each room’s state references the owner socket and tracks array; member sockets reference a room for scoped broadcasts

## ENVIRONMENT VARIABLES
- **Frontend (`sync-tune-ui-main/.env.local` example):**
  ```env
  NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
  NEXT_PUBLIC_YT_API_KEY=AIza...
  ```
- **Backend (`sync-tune-api-main/.env` example):**
  ```env
  PORT=3000
  ```

## DEPLOYMENT
- **Frontend:** Build (`npm run build`) and host on Vercel, Netlify, or similar; configure `NEXT_PUBLIC_SOCKET_URL` to the deployed backend.
- **Backend:** Deploy Express/Socket.IO server on Railway, Fly.io, Render, etc.; ensure `logs/rooms` is writable and `PORT` is set.
- **Environment configuration:** Use platform dashboards for env vars; lock down CORS for production domains instead of `*`.

### Live Demo
- [https://sync-tune-five.vercel.app/](https://sync-tune-five.vercel.app/)

## SECURITY CONSIDERATIONS
- **Authentication security:** Consider adding passphrases or OAuth for rooms to prevent unauthorized hosts.
- **API protection:** Limit CORS origins, validate incoming payloads (room IDs, track data).
- **Data validation:** Introduce schema validation (e.g., Zod) on both socket payloads and frontend inputs before emitting.

## FUTURE IMPROVEMENTS
- **Scalability:** Add Redis or a database to persist rooms, enable horizontal Socket.IO scaling.
- **Feature enhancements:** Add authenticated profiles, saved playlists, multi-room dashboards, track search/browse beyond YouTube playlists.
- **Performance:** Debounce frequent playlist updates, batch socket emissions, and cache YouTube API responses.

## CONTRIBUTION GUIDELINES
- Fork the repository, create a descriptive branch (`feat/`, `fix/`, `chore/`), document changes, and open a PR.
- Keep PRs focused, include screenshots/GIFs for UI work, and request reviews after lint/build passes.
- Run linters/tests before merging; keep default branch clean and release-ready.

## LICENSE
TBD (e.g., MIT)

