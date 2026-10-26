from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

import main

ORIGIN = {"origin": main.ALLOWED_ORIGIN}
SYNC = {"type": "sync", "data": {"songId": 1, "elapsed": 2.5, "isPlaying": True, "playbackRate": 1.0}}


@pytest.fixture(autouse=True)
def reset_state() -> None:
    main.rooms.clear()
    main.hits.clear()


@pytest.fixture
def client() -> TestClient:
    return TestClient(main.app)


def create(client: TestClient, ip: str = "1.1.1.1") -> tuple[str, str]:
    res = client.post("/rooms", headers={**ORIGIN, "x-real-ip": ip})
    assert res.status_code == 200
    body = res.json()
    return body["code"], body["hostToken"]


def assert_closed(ws, code: int) -> None:
    with pytest.raises(WebSocketDisconnect) as exc:
        ws.receive_json()
    assert exc.value.code == code


def test_create_room_returns_strong_code_and_token(client: TestClient) -> None:
    code, token = create(client)

    assert len(code) == 6 and all(c in main.CODE_ALPHABET for c in code)
    assert len(token) >= 32


def test_host_without_token_is_rejected(client: TestClient) -> None:
    code, _ = create(client)

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as ws:
        ws.send_json({"type": "sync", "data": SYNC["data"]})
        assert_closed(ws, main.CLOSE_UNAUTHORIZED)


def test_host_with_wrong_token_is_rejected(client: TestClient) -> None:
    code, _ = create(client)

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as ws:
        ws.send_json({"type": "auth", "data": {"token": "not-the-token"}})
        assert_closed(ws, main.CLOSE_UNAUTHORIZED)


def test_host_with_token_relays_sync_to_participant(client: TestClient) -> None:
    code, token = create(client)

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as host:
        host.send_json({"type": "auth", "data": {"token": token}})
        assert host.receive_json()["data"]["isHost"] is True
        with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as guest:
            assert guest.receive_json()["data"]["isHost"] is False
            assert host.receive_json() == {"type": "count", "data": {"count": 2}}
            host.send_json(SYNC)

            assert guest.receive_json() == SYNC


def test_late_joiner_gets_paused_state_unchanged(client: TestClient) -> None:
    code, token = create(client)
    paused = {"type": "sync", "data": {**SYNC["data"], "isPlaying": False}}

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as host:
        host.send_json({"type": "auth", "data": {"token": token}})
        host.receive_json()
        with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as first:
            first.receive_json()
            host.send_json(paused)
            assert first.receive_json() == paused
            with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as late:
                late.receive_json()

                assert late.receive_json() == paused


def test_late_joiner_gets_elapsed_advanced_while_playing(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    code, token = create(client)
    clock = [100.0]
    monkeypatch.setattr(main.time, "monotonic", lambda: clock[0])
    fast = {"type": "sync", "data": {**SYNC["data"], "playbackRate": 1.5}}

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as host:
        host.send_json({"type": "auth", "data": {"token": token}})
        host.receive_json()
        with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as first:
            first.receive_json()
            host.send_json(fast)
            assert first.receive_json() == fast  # state is stored once relayed
            clock[0] = 104.0
            with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as late:
                late.receive_json()

                assert late.receive_json()["data"]["elapsed"] == pytest.approx(2.5 + 4 * 1.5)
                late.send_json({"type": "request_state"})
                assert late.receive_json()["data"]["elapsed"] == pytest.approx(8.5)


def test_second_host_with_valid_token_cannot_replace_host(client: TestClient) -> None:
    code, token = create(client)

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as host:
        host.send_json({"type": "auth", "data": {"token": token}})
        host.receive_json()
        with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as other:
            other.send_json({"type": "auth", "data": {"token": token}})
            assert_closed(other, main.CLOSE_POLICY)


def test_host_cannot_create_room_with_arbitrary_code(client: TestClient) -> None:
    with client.websocket_connect("/ws/ABCDEF?role=host", headers=ORIGIN) as ws:
        assert ws.receive_json()["type"] == "error"
        assert_closed(ws, main.CLOSE_NOT_FOUND)

    assert "ABCDEF" not in main.rooms


def test_participant_cannot_act_as_host(client: TestClient) -> None:
    code, token = create(client)

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as host:
        host.send_json({"type": "auth", "data": {"token": token}})
        host.receive_json()
        with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as a:
            a.receive_json()
            host.receive_json()
            with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as b:
                b.receive_json()
                host.receive_json()
                a.send_json(SYNC)
                assert_closed(a, main.CLOSE_POLICY)
                assert host.receive_json() == {"type": "count", "data": {"count": 2}}
                host.send_json(SYNC)

                assert b.receive_json() == SYNC  # b never saw a's forged sync


def test_host_payload_outside_schema_is_not_relayed(client: TestClient) -> None:
    code, token = create(client)

    with client.websocket_connect(f"/ws/{code}?role=host", headers=ORIGIN) as host:
        host.send_json({"type": "auth", "data": {"token": token}})
        host.receive_json()
        with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as guest:
            guest.receive_json()
            host.receive_json()
            host.send_json({"type": "sync", "data": {"html": "<script>"}})
            host.send_json(SYNC)

            assert guest.receive_json() == SYNC


@pytest.mark.parametrize("code", ["1234", "abcdef", "ABCDE0", "ABCDEFG", "AB%2FCDE"])
def test_lookup_rejects_bad_codes(client: TestClient, code: str) -> None:
    res = client.get(f"/rooms/{code}", headers=ORIGIN)

    assert res.status_code in (404, 422)


@pytest.mark.parametrize("path", ["/ws/1234?role=client", "/ws/ABCDEF?role=admin", "/ws/abcdef?role=host"])
def test_websocket_rejects_bad_code_or_role(client: TestClient, path: str) -> None:
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(path, headers=ORIGIN) as ws:
            ws.receive_json()

    assert exc.value.code == main.CLOSE_POLICY


def test_oversize_message_is_rejected(client: TestClient) -> None:
    code, _ = create(client)

    with client.websocket_connect(f"/ws/{code}?role=client", headers=ORIGIN) as ws:
        ws.receive_json()
        ws.send_text("x" * (main.MAX_MESSAGE_BYTES + 1))
        assert_closed(ws, main.CLOSE_TOO_BIG)


def test_cors_allows_site_origin(client: TestClient) -> None:
    res = client.get("/rooms/ABCDEF", headers=ORIGIN)

    assert res.headers["access-control-allow-origin"] == main.ALLOWED_ORIGIN


@pytest.mark.parametrize("origin", ["http://localhost:5173", "http://127.0.0.1:4173"])
def test_cors_allows_localhost(client: TestClient, origin: str) -> None:
    res = client.get("/rooms/ABCDEF", headers={"origin": origin})

    assert res.headers["access-control-allow-origin"] == origin


def test_cors_rejects_other_origins(client: TestClient) -> None:
    preflight = client.options(
        "/rooms",
        headers={"origin": "https://evil.example", "access-control-request-method": "POST"},
    )
    simple = client.get("/rooms/ABCDEF", headers={"origin": "https://evil.example"})

    assert preflight.status_code == 400
    assert "access-control-allow-origin" not in simple.headers


def test_websocket_rejects_other_origins(client: TestClient) -> None:
    code, _ = create(client)

    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect(f"/ws/{code}", headers={"origin": "https://evil.example"}) as ws:
            ws.receive_json()


def test_room_creation_is_rate_limited_per_ip(client: TestClient) -> None:
    for _ in range(main.LIMITS["create"]):
        create(client, ip="2.2.2.2")

    blocked = client.post("/rooms", headers={"x-real-ip": "2.2.2.2"})
    other_ip = client.post("/rooms", headers={"x-real-ip": "3.3.3.3"})

    assert blocked.status_code == 429
    assert other_ip.status_code == 200


def test_lookup_is_rate_limited_per_ip(client: TestClient) -> None:
    headers = {"x-real-ip": "4.4.4.4"}
    for _ in range(main.LIMITS["lookup"]):
        assert client.get("/rooms/ABCDEF", headers=headers).status_code == 200

    assert client.get("/rooms/ABCDEF", headers=headers).status_code == 429


def test_spoofed_forwarded_for_does_not_bypass_limit(client: TestClient) -> None:
    for i in range(main.LIMITS["lookup"]):
        client.get("/rooms/ABCDEF", headers={"x-forwarded-for": f"9.9.9.{i}", "x-real-ip": "5.5.5.5"})

    res = client.get("/rooms/ABCDEF", headers={"x-forwarded-for": "8.8.8.8", "x-real-ip": "5.5.5.5"})

    assert res.status_code == 429


@pytest.mark.parametrize("path", ["/docs", "/redoc", "/openapi.json"])
def test_api_docs_disabled_by_default(client: TestClient, path: str) -> None:
    assert client.get(path).status_code == 404
