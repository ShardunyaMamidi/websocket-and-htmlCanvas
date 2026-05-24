# Sketch It Out — Implementation Roadmap

A phased plan to evolve this project from a **collaborative drawing + chat prototype** into a **skribbl.io-style** multiplayer drawing and guessing game.

**Stack:** Angular (`drawing-fe`) + Spring Boot WebSocket/STOMP (`websocket-stomp`)

**How to use this doc:** Work top to bottom within each phase. Check off tasks (`[x]`) as you complete them. The [MVP slice](#mvp-slice-smallest-playable-game) is the fastest path to a playable round loop.

---

## Current state (already built)

- [x] STOMP over SockJS (`/ws-game`, `/app`, `/topic`)
- [x] Lobby UI (username + room ID → drawing screen)
- [x] Real-time canvas strokes (`LocationController` + `drawing-board`)
- [x] Per-room chat (`ChatController`)
- [x] In-memory stroke history + late-join subscription
- [x] `Player` REST API + H2 persistence (not wired to lobby/game yet)
- [x] Debug endpoint for in-memory canvas (`/api/debug/canvas/{roomId}`)

---

## Phase 0 — Foundation & cleanup

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 0.1 | Project README & runbook | Document how to start backend/frontend, ports, env vars, and intended game flow. |
| [ ] | 0.2 | Align domain models | Unify `Coordinate.DrawingType` with frontend (`START` / `DRAW` / `END`); include `senderId`, `color`, `brushSize` in `DrawAction` for correct history replay. |
| [ ] | 0.3 | Wire lobby to backend | On join, register/update `Player` with `roomId`, `name`, `isActive`; stop relying only on query params. |
| [ ] | 0.4 | Room registry | Create/join rooms, list players in room, max capacity; in-memory first, DB optional later. |
| [ ] | 0.5 | Session / identity | Stable `playerId` per browser (e.g. UUID in `localStorage`) so reconnects and scoring don’t depend on display name alone. |

---

## Phase 1 — Room presence & sync

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 1.1 | Player list broadcast | On join/leave/disconnect, broadcast `/topic/{roomId}/players` so UI shows who’s in the room. |
| [ ] | 1.2 | Host / room owner | First joiner (or “create room”) becomes host; host can start game (and optionally kick). |
| [ ] | 1.3 | Disconnect handling | Detect WebSocket disconnect; mark player inactive, notify room; pause or skip if drawer leaves. |
| [ ] | 1.4 | Reconnect + state snapshot | On reconnect, send snapshot: players, game phase, drawer, hint, canvas history, scores. |
| [ ] | 1.5 | Clear canvas API | “Clear board” via STOMP (host or new round); call `InMemoryCanvasService.clearCanvas` and sync all clients. |

---

## Phase 2 — Game state machine (core loop)

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 2.1 | Game phases enum | Server-owned states: `LOBBY`, `WORD_CHOICE`, `DRAWING`, `ROUND_END`, `GAME_END`. |
| [ ] | 2.2 | Start game | Host starts when min players met; pick first drawer; transition to `WORD_CHOICE` or `DRAWING`. |
| [ ] | 2.3 | Turn rotation | After each round, advance drawer circularly; skip inactive players. |
| [ ] | 2.4 | Round timer | Server countdown for draw phase; broadcast ticks; auto-end at 0. |
| [ ] | 2.5 | Between-round delay | `ROUND_END` screen: word reveal, who guessed, points; then next drawer. |
| [ ] | 2.6 | End game | After N rounds per player or score cap; final leaderboard; return to lobby. |

---

## Phase 3 — Words & drawing permissions

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 3.1 | Word bank | Curated word list (JSON/DB) by difficulty/category; server offers 3 options to drawer. |
| [ ] | 3.2 | Word choice (drawer only) | Drawer picks one word; secret stored server-side only. |
| [ ] | 3.3 | Hint display | Masked word (`_ _ _ o _`) from length; optional letter reveals as in skribbl. |
| [ ] | 3.4 | Drawer-only drawing | Reject draw messages from non-drawer; disable canvas for guessers in UI. |
| [ ] | 3.5 | Brush tools (optional) | Color, brush size, eraser; persist in `DrawAction` for replay. |

---

## Phase 4 — Guessing & scoring

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 4.1 | Guess via chat | During `DRAWING`, server checks guesser messages against secret word (case-insensitive). |
| [ ] | 4.2 | Correct guess handling | Tiered points by order/time; drawer earns points when someone guesses. |
| [ ] | 4.3 | Near-miss (optional) | “Close!” feedback without revealing the word. |
| [ ] | 4.4 | Anti-cheat for drawer | Drawer cannot guess; never send raw word to non-drawers. |
| [ ] | 4.5 | Score persistence | Update scores each round; broadcast `/topic/{roomId}/scores`. |
| [ ] | 4.6 | “Someone guessed” UI | Announce correct guess without leaking word until round end. |

---

## Phase 5 — Frontend game UI

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 5.1 | Game shell layout | Top bar: round, timer, hint; canvas; sidebar: chat, players, scores. |
| [ ] | 5.2 | Lobby enhancements | Create vs join, player count, “waiting for host”, host-only start. |
| [ ] | 5.3 | Word choice modal | Drawer sees 3 options; others see “XY is choosing a word”. |
| [ ] | 5.4 | Phase-driven UI | Enable/disable chat, canvas, inputs from server `GameState` events. |
| [ ] | 5.5 | Timer & round banners | Countdown UI; “Round 2/3”, “XY is drawing”. |
| [ ] | 5.6 | Leaderboard component | Live scores + end-game modal. |
| [ ] | 5.7 | Fix canvas history replay | Replay `START`/`DRAW`/`END` with colors; handle mid-round join. |

---

## Phase 6 — Backend architecture

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 6.1 | `GameService` per room | Central service: players, phase, word, drawer, timer, scores. |
| [ ] | 6.2 | STOMP message catalog | Document `/app/...` commands vs `/topic/...` events; version DTOs. |
| [ ] | 6.3 | Scheduled tasks | Server-side timers (`@Scheduled` or per-room executor), not client-only. |
| [ ] | 6.4 | REST for non-real-time | Room create, word admin, health; gameplay stays on WebSocket. |
| [ ] | 6.5 | Package hygiene | Rename e.g. `incanvasMemoryController` → `CanvasDebugController`; consistent naming. |

---

## Phase 7 — Data & persistence

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 7.1 | Room + GameSession entities | Persist room metadata; keep active game in memory for speed. |
| [ ] | 7.2 | Player ↔ room rules | One active room per player or explicit multi-room rules. |
| [ ] | 7.3 | Redis (optional) | Shared state if running multiple backend instances. |
| [ ] | 7.4 | Word bank in DB | Seed/migrate categories and difficulty. |

---

## Phase 8 — Quality, security, ops

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 8.1 | Input validation | Max chat length, guess rate limits, coordinate bounds. |
| [ ] | 8.2 | CORS & profiles | `dev` vs `prod` origins; externalize frontend URL. |
| [ ] | 8.3 | Error handling | STOMP errors + user toasts (“room full”, “not your turn”). |
| [ ] | 8.4 | Backend unit tests | `GameService`: scoring, rotation, phase transitions. |
| [ ] | 8.5 | Frontend tests | Join room, draw events, correct guess flow. |
| [ ] | 8.6 | E2E smoke test | Two sessions: draw, guess, score updates. |
| [ ] | 8.7 | Docker Compose (optional) | One command: backend + frontend (+ DB). |

---

## Phase 9 — Nice-to-have (post-MVP)

| Status | ID | Task | Summary |
|--------|-----|------|---------|
| [ ] | 9.1 | Custom word lists | Host-supplied words for private rooms. |
| [ ] | 9.2 | Spectators | Watch without guessing. |
| [ ] | 9.3 | Avatars & cursor colors | Per-player color on canvas (if adding live cursors). |
| [ ] | 9.4 | Sound & themes | Round start, correct guess, timer warning. |
| [ ] | 9.5 | Internationalization | UI + word lists per locale. |
| [ ] | 9.6 | Private rooms / passwords | Room code + optional password. |

---

## MVP slice (smallest playable game)

Implement in this order for a **single playable loop** before finishing every phase:

| Order | IDs | Outcome |
|-------|-----|---------|
| 1 | 0.2, 0.3, 1.1 | Stable players visible in room |
| 2 | 2.1–2.4, 3.1–3.4 | One drawer, timer, word choice, guessers can’t draw |
| 3 | 4.1–4.2, 4.5 | Guessing in chat, scoring, round rotation |
| 4 | 5.1–5.4, 5.7 | UI follows server; history replay works |

**MVP flow:** Lobby → host starts → drawer picks word → draw (timer) → others guess in chat → scores → next player.

---

## Suggested implementation order (full roadmap)

```
Phase 0  →  Phase 1  →  Phase 2  →  Phase 3  →  Phase 4
                                              ↘
Phase 5 (UI in parallel once 2.x events exist)  →  Phase 6  →  Phase 7  →  Phase 8  →  Phase 9
```

- **Phase 0–1:** Required before any real “game”
- **Phase 2–4:** Core skribbl mechanics (backend-first)
- **Phase 5:** Wire UI as soon as `GameState` events exist (can overlap 3–4)
- **Phase 6:** Refactor when controllers get crowded (often after 2.4)
- **Phase 7–9:** After MVP is playable

---

## Local development (reference)

| Service | Path | Command | URL |
|---------|------|---------|-----|
| Backend | `websocket-stomp/` | `./mvnw spring-boot:run` | http://localhost:8090 |
| Frontend | `drawing-fe/` | `npm start` | http://localhost:4200 |
| H2 console | — | — | http://localhost:8090/h2-console |

**WebSocket:** `http://localhost:8090/ws-game` (SockJS + STOMP)

---

## Progress log

Use this section to note completed milestones (optional).

| Date | Milestone |
|------|-----------|
| — | Roadmap created |
| | |

---

## Related files

| Area | Location |
|------|----------|
| WebSocket config | `websocket-stomp/.../config/WebSocketConfig.java` |
| Draw + history | `websocket-stomp/.../controller/LocationController.java` |
| Chat | `websocket-stomp/.../controller/ChatController.java` |
| Canvas memory | `websocket-stomp/.../service/InMemoryCanvasService.java` |
| Angular WS client | `drawing-fe/src/app/services/websocket.service.ts` |
| Lobby / board | `drawing-fe/src/app/components/lobby/`, `drawing-board/` |

---

*Update checkboxes in this file as tasks ship. Start with [0.1](#phase-0--foundation--cleanup) or jump to the [MVP slice](#mvp-slice-smallest-playable-game) if you want a playable game sooner.*
