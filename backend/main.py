from __future__ import annotations

import asyncio
import json
import random
import string
import time
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SingLah Party")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Room:
    def __init__(self, host: WebSocket) -> None:
        self.host: WebSocket = host
        self.clients: set[WebSocket] = set()
        self.state: dict[str, Any] = {}
        self.last_activity: float = time.time()

    @property
    def count(self) -> int:
        return 1 + len(self.clients)


rooms: dict[str, Room] = {}


def generate_code() -> str:
    for _ in range(100):
        code = "".join(random.choices(string.digits, k=4))
        if code not in rooms:
            return code
    raise RuntimeError("No available room codes")


@app.post("/rooms")
async def create_room() -> dict[str, str]:
    code = generate_code()
    rooms[code] = Room(host=None)  # type: ignore[arg-type]
    return {"code": code}


@app.get("/rooms/{code}")
async def room_exists(code: str) -> dict[str, bool]:
    return {"exists": code in rooms}


@app.websocket("/ws/{code}")
async def ws_endpoint(ws: WebSocket, code: str, role: str = "client") -> None:
    await ws.accept()

    if role == "host":
        if code not in rooms:
            rooms[code] = Room(host=ws)
        else:
            rooms[code].host = ws
        room = rooms[code]
        room.last_activity = time.time()

        await ws.send_json(
            {"type": "room_joined", "data": {"code": code, "isHost": True, "count": room.count}}
        )

        try:
            while True:
                data = await ws.receive_json()
                room.last_activity = time.time()

                if data.get("type") in ("sync", "song_change"):
                    for client in list(room.clients):
                        try:
                            await client.send_json(data)
                        except Exception:
                            room.clients.discard(client)

                    # Broadcast updated count
                    count_msg = {"type": "count", "data": {"count": room.count}}
                    for client in list(room.clients):
                        try:
                            await client.send_json(count_msg)
                        except Exception:
                            room.clients.discard(client)
        except WebSocketDisconnect:
            pass
        finally:
            # Close all clients when host leaves
            for client in list(room.clients):
                try:
                    await client.send_json({"type": "room_closed"})
                    await client.close()
                except Exception:
                    pass
            rooms.pop(code, None)

    else:
        # Client joining
        if code not in rooms:
            await ws.send_json({"type": "error", "data": {"message": "Room not found"}})
            await ws.close()
            return

        room = rooms[code]
        room.clients.add(ws)
        room.last_activity = time.time()

        await ws.send_json(
            {"type": "room_joined", "data": {"code": code, "isHost": False, "count": room.count}}
        )

        # Send current state to new client
        if room.state:
            await ws.send_json({"type": "sync", "data": room.state})

        # Notify host of count change
        if room.host:
            try:
                await room.host.send_json({"type": "count", "data": {"count": room.count}})
            except Exception:
                pass

        try:
            while True:
                data = await ws.receive_json()
                room.last_activity = time.time()

                if data.get("type") == "request_state" and room.state:
                    await ws.send_json({"type": "sync", "data": room.state})
        except WebSocketDisconnect:
            pass
        finally:
            room.clients.discard(ws)
            if code in rooms and rooms[code].host:
                try:
                    await rooms[code].host.send_json(
                        {"type": "count", "data": {"count": rooms[code].count}}
                    )
                except Exception:
                    pass


@app.on_event("startup")
async def start_cleanup() -> None:
    asyncio.create_task(_cleanup_stale_rooms())


async def _cleanup_stale_rooms() -> None:
    while True:
        await asyncio.sleep(300)
        now = time.time()
        stale = [code for code, room in rooms.items() if now - room.last_activity > 3600]
        for code in stale:
            room = rooms.pop(code, None)
            if room:
                for ws in [room.host, *room.clients]:
                    if ws:
                        try:
                            await ws.close()
                        except Exception:
                            pass
