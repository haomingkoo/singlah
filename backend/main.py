from __future__ import annotations

import asyncio
import hmac
import json
import re
import secrets
import time
from collections import defaultdict, deque
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Path, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError

ALLOWED_ORIGIN = "https://singlah.kooexperience.com"
DEV_ORIGIN_REGEX = r"^http://(localhost|127\.0\.0\.1)(:\d+)?$"

# 32 unambiguous symbols (no 0/O, 1/I): 32^6 ~ 1.07e9 codes.
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
CODE_LENGTH = 6
CODE_PATTERN = f"^[{CODE_ALPHABET}]{{{CODE_LENGTH}}}$"

MAX_MESSAGE_BYTES = 4096
MAX_ROOMS = 1000
AUTH_TIMEOUT_SECONDS = 5
ROOM_IDLE_SECONDS = 3600
WINDOW_SECONDS = 60
LIMITS = {"create": 10, "lookup": 30, "join": 30}

CLOSE_POLICY = 1008
CLOSE_TOO_BIG = 1009
CLOSE_UNAUTHORIZED = 4401
CLOSE_NOT_FOUND = 4404
CLOSE_RATE_LIMITED = 4429

app = FastAPI(title="SingLah Party")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_origin_regex=DEV_ORIGIN_REGEX,
    allow_methods=["GET", "POST"],
)


class Room:
    def __init__(self, host_token: str) -> None:
        self.host_token = host_token
        self.host: WebSocket | None = None
        self.clients: set[WebSocket] = set()
        self.state: dict[str, Any] = {}
        self.last_activity: float = time.time()

    @property
    def count(self) -> int:
        return 1 + len(self.clients)


class SyncData(BaseModel):
    songId: int
    elapsed: float
    isPlaying: bool
    playbackRate: float


class HostMessage(BaseModel):
    type: Literal["sync", "song_change"]
    data: SyncData


rooms: dict[str, Room] = {}
hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def client_ip(headers: Any, peer: Any) -> str:
    # Railway's proxy appends the real peer, so the rightmost entry can't be spoofed.
    forwarded = headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return peer.host if peer else "unknown"


def allow(bucket: str, ip: str) -> bool:
    now = time.time()
    q = hits[(bucket, ip)]
    while q and now - q[0] > WINDOW_SECONDS:
        q.popleft()
    if len(q) >= LIMITS[bucket]:
        return False
    q.append(now)
    return True


def origin_allowed(origin: str | None) -> bool:
    return origin is None or origin == ALLOWED_ORIGIN or re.match(DEV_ORIGIN_REGEX, origin) is not None


def generate_code() -> str:
    for _ in range(100):
        code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
        if code not in rooms:
            return code
    raise RuntimeError("No available room codes")


RoomCode = Path(pattern=CODE_PATTERN)


@app.post("/rooms")
async def create_room(request: Request) -> dict[str, str]:
    if not allow("create", client_ip(request.headers, request.client)):
        raise HTTPException(status_code=429, detail="Too many requests")
    if len(rooms) >= MAX_ROOMS:
        raise HTTPException(status_code=503, detail="Server busy")
    code = generate_code()
    token = secrets.token_urlsafe(24)
    rooms[code] = Room(host_token=token)
    return {"code": code, "hostToken": token}


@app.get("/rooms/{code}")
async def room_exists(request: Request, code: str = RoomCode) -> dict[str, bool]:
    if not allow("lookup", client_ip(request.headers, request.client)):
        raise HTTPException(status_code=429, detail="Too many requests")
    return {"exists": code in rooms}


async def receive(ws: WebSocket) -> dict[str, Any] | None:
    """Return the next JSON object, or None after closing the socket for a bad message."""
    text = await ws.receive_text()
    if len(text.encode()) > MAX_MESSAGE_BYTES:
        await ws.close(code=CLOSE_TOO_BIG)
        return None
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        data = None
    if not isinstance(data, dict):
        await ws.close(code=CLOSE_POLICY)
        return None
    return data


async def broadcast(room: Room, message: dict[str, Any]) -> None:
    for client in list(room.clients):
        try:
            await client.send_json(message)
        except Exception:
            room.clients.discard(client)


async def authenticate_host(ws: WebSocket, room: Room) -> bool:
    try:
        msg = await asyncio.wait_for(receive(ws), AUTH_TIMEOUT_SECONDS)
    except asyncio.TimeoutError:
        msg = None
    data = msg.get("data") if msg and msg.get("type") == "auth" else None
    token = data.get("token") if isinstance(data, dict) else None
    if not isinstance(token, str) or not hmac.compare_digest(token.encode(), room.host_token.encode()):
        if ws.client_state.name != "DISCONNECTED":
            await ws.close(code=CLOSE_UNAUTHORIZED)
        return False
    return True


async def run_host(ws: WebSocket, code: str, room: Room) -> None:
    if not await authenticate_host(ws, room):
        return
    if room.host is not None:
        await ws.close(code=CLOSE_POLICY)
        return
    room.host = ws
    room.last_activity = time.time()
    await ws.send_json({"type": "room_joined", "data": {"code": code, "isHost": True, "count": room.count}})
    try:
        while (data := await receive(ws)) is not None:
            room.last_activity = time.time()
            try:
                msg = HostMessage.model_validate(data)
            except ValidationError:
                continue
            await broadcast(room, msg.model_dump())
            await broadcast(room, {"type": "count", "data": {"count": room.count}})
    except WebSocketDisconnect:
        pass
    finally:
        for client in list(room.clients):
            try:
                await client.send_json({"type": "room_closed"})
                await client.close()
            except Exception:
                pass
        rooms.pop(code, None)


async def notify_host_count(room: Room) -> None:
    if room.host:
        try:
            await room.host.send_json({"type": "count", "data": {"count": room.count}})
        except Exception:
            pass


async def run_client(ws: WebSocket, code: str, room: Room) -> None:
    room.clients.add(ws)
    room.last_activity = time.time()
    await ws.send_json({"type": "room_joined", "data": {"code": code, "isHost": False, "count": room.count}})
    if room.state:
        await ws.send_json({"type": "sync", "data": room.state})
    await notify_host_count(room)
    try:
        # Participants only receive; request_state is the one message they may send.
        while (data := await receive(ws)) is not None:
            room.last_activity = time.time()
            if data.get("type") != "request_state":
                await ws.close(code=CLOSE_POLICY)
                break
            if room.state:
                await ws.send_json({"type": "sync", "data": room.state})
    except WebSocketDisconnect:
        pass
    finally:
        room.clients.discard(ws)
        await notify_host_count(room)


@app.websocket("/ws/{code}")
async def ws_endpoint(
    ws: WebSocket, code: str = RoomCode, role: Literal["host", "client"] = "client"
) -> None:
    if not origin_allowed(ws.headers.get("origin")):
        await ws.close(code=CLOSE_POLICY)
        return
    if not allow("join", client_ip(ws.headers, ws.client)):
        await ws.close(code=CLOSE_RATE_LIMITED)
        return
    await ws.accept()
    room = rooms.get(code)
    if room is None:
        await ws.send_json({"type": "error", "data": {"message": "Room not found"}})
        await ws.close(code=CLOSE_NOT_FOUND)
        return
    if role == "host":
        await run_host(ws, code, room)
    else:
        await run_client(ws, code, room)


@app.on_event("startup")
async def start_cleanup() -> None:
    asyncio.create_task(_cleanup_stale_rooms())


async def _cleanup_stale_rooms() -> None:
    while True:
        await asyncio.sleep(300)
        now = time.time()
        for key in [k for k, q in hits.items() if not q or now - q[-1] > WINDOW_SECONDS]:
            hits.pop(key, None)
        stale = [code for code, room in rooms.items() if now - room.last_activity > ROOM_IDLE_SECONDS]
        for code in stale:
            room = rooms.pop(code, None)
            if room:
                for ws in [room.host, *room.clients]:
                    if ws:
                        try:
                            await ws.close()
                        except Exception:
                            pass
