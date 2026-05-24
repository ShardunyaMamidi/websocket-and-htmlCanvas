# Sketch It Out

A multiplayer drawing and chat prototype inspired by [skribbl.io](https://skribbl.io), built with **Angular** and **Spring Boot WebSocket (STOMP)**.

## Prerequisites

- Java 21+
- Node.js 20+ and npm
- Maven (or use `./mvnw` in `websocket-stomp/`)

## Quick start

### 1. Backend (`websocket-stomp`)

```bash
cd websocket-stomp
./mvnw spring-boot:run
```

Runs on **http://localhost:8090**

- WebSocket (SockJS): `http://localhost:8090/ws-game`
- H2 console: `http://localhost:8090/h2-console` (JDBC URL: `jdbc:h2:mem:skribbl`, user: `sa`, no password)

### 2. Frontend (`drawing-fe`)

```bash
cd drawing-fe
npm install
npm start
```

Opens **http://localhost:4200** (lobby → drawing room).

## Configuration

| Setting | Location | Default |
|---------|----------|---------|
| API / WS URLs | `drawing-fe/src/environments/environment.ts` | `8090` |
| Server port | `websocket-stomp/.../application.properties` | `8090` |
| Max players per room | `app.room.max-players` | `12` |

## Game flow (current)

1. Open the lobby, enter a **username** and **room ID**.
2. Optionally check **Create new room** (otherwise the room is created on first join).
3. The app assigns a stable **player ID** in `localStorage` and registers you via the REST API.
4. In the drawing room: shared canvas (real-time strokes), chat, stroke history for late joiners.

See [ROADMAP.md](./ROADMAP.md) for planned features (guessing, rounds, scoring, etc.).

## REST API (Phase 0)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/rooms` | Create room `{ roomId, roomName?, maxPlayers? }` |
| `POST` | `/api/rooms/{roomId}/join` | Join `{ playerId, name }` → player + room roster |
| `POST` | `/api/rooms/{roomId}/leave` | Leave `{ playerId }` |
| `GET` | `/api/rooms/{roomId}/players` | Active players in room |
| `GET` | `/api/rooms/{roomId}` | Room summary |
| `GET` | `/api/debug/canvas/{roomId}` | In-memory stroke history (debug) |

## WebSocket (STOMP)

| Direction | Destination | Purpose |
|-----------|-------------|---------|
| Subscribe | `/topic/{roomId}/chat` | Chat messages |
| Subscribe | `/topic/{roomId}/location` | Live draw events |
| Subscribe | `/room/{roomId}/history` | Canvas history on subscribe |
| Send | `/app/room/{roomId}/get-location` | Draw stroke `{ x, y, type, senderId, color, brushSize }` |
| Send | `/app/{roomId}/chat.sendMessage` | Chat message |
| Send | `/app/{roomId}/chat.addUser` | Join announcement |

Draw `type` values: `START`, `DRAW`, `END`.

## Project layout

```
skribbl.io/
├── drawing-fe/          # Angular UI
├── websocket-stomp/     # Spring Boot API + WebSocket
├── ROADMAP.md           # Feature phases
└── README.md            # This file
```

## Development tips

- Start the **backend before** the frontend; the lobby calls REST on join.
- Use two browser profiles or incognito windows to test two players in the same room.
- CORS is allowed for `http://localhost:4200` and `http://127.0.0.1:4200`.
