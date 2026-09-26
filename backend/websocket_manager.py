import asyncio
import json
import logging
from typing import Dict, Set, Any, List, Optional
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger("websocket_manager")

class ConnectionManager:
    """
    Central Real-Time WebSocket Manager for Campus Connect.
    Powers online presence tracking, marketplace live feed updates,
    direct/peer messaging, request status updates, and HOD background sync.
    """

    def __init__(self):
        # Maps user PIN to a set of active WebSockets (supports multiple tabs)
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Reverse map for rapid disconnect cleanup
        self.socket_to_pin: Dict[WebSocket, str] = {}
        # Set of all active online PINs
        self.online_pins: Set[str] = set()

    async def connect(self, websocket: WebSocket, pin: str, name: str = ""):
        """Accepts a new WebSocket connection and broadcasts online presence."""
        await websocket.accept()
        clean_pin = pin.strip().upper()

        if clean_pin not in self.active_connections:
            self.active_connections[clean_pin] = set()

        self.active_connections[clean_pin].add(websocket)
        self.socket_to_pin[websocket] = clean_pin
        is_first_connection = clean_pin not in self.online_pins
        self.online_pins.add(clean_pin)

        # Update database presence
        self._update_db_online_status(clean_pin, True)

        # Send initial handshake state to the connected client
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "pin": clean_pin,
            "online_pins": list(self.online_pins),
            "timestamp": datetime.utcnow().isoformat()
        })

        # If user just came online, broadcast presence update to all clients
        if is_first_connection:
            await self.broadcast({
                "type": "PRESENCE_UPDATE",
                "pin": clean_pin,
                "name": name,
                "status": "ONLINE",
                "online_pins": list(self.online_pins),
                "timestamp": datetime.utcnow().isoformat()
            })

    async def disconnect(self, websocket: WebSocket):
        """Cleans up disconnected socket and broadcasts offline presence if no active tabs remain."""
        clean_pin = self.socket_to_pin.get(websocket)
        if websocket in self.socket_to_pin:
            del self.socket_to_pin[websocket]

        if clean_pin and clean_pin in self.active_connections:
            self.active_connections[clean_pin].discard(websocket)
            if len(self.active_connections[clean_pin]) == 0:
                del self.active_connections[clean_pin]
                self.online_pins.discard(clean_pin)

                # Update database presence
                self._update_db_online_status(clean_pin, False)

                # Broadcast offline status to all clients
                await self.broadcast({
                    "type": "PRESENCE_UPDATE",
                    "pin": clean_pin,
                    "status": "OFFLINE",
                    "online_pins": list(self.online_pins),
                    "timestamp": datetime.utcnow().isoformat()
                })

    async def send_personal_message(self, recipient_pin: str, message: Dict[str, Any]) -> bool:
        """Sends a real-time message payload directly to a specific user PIN across all their active tabs."""
        clean_pin = recipient_pin.strip().upper()
        target_sockets = self.active_connections.get(clean_pin, set())
        delivered = False

        dead_sockets = set()
        for ws in target_sockets:
            try:
                await ws.send_json(message)
                delivered = True
            except Exception as e:
                logger.warning(f"Failed to send to socket for {clean_pin}: {e}")
                dead_sockets.add(ws)

        for dead_ws in dead_sockets:
            await self.disconnect(dead_ws)

        return delivered

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcasts a payload to every active WebSocket connection on the platform."""
        all_sockets = list(self.socket_to_pin.keys())
        for ws in all_sockets:
            try:
                await ws.send_json(message)
            except Exception:
                # Disconnect handler will clean up dead sockets
                pass

    def get_online_pins(self) -> List[str]:
        """Returns the list of currently online student and staff PINs."""
        return list(self.online_pins)

    def is_user_online(self, pin: str) -> bool:
        """Checks if a user is currently online."""
        return pin.strip().upper() in self.online_pins

    def _update_db_online_status(self, pin: str, is_online: bool):
        """Silently syncs online presence flag to SQLite database."""
        try:
            from database import SessionLocal, StudentDB
            db = SessionLocal()
            try:
                user = db.query(StudentDB).filter(StudentDB.pin == pin).first()
                if user:
                    user.is_online = is_online
                    user.last_seen = datetime.utcnow().isoformat()
                    db.commit()
            finally:
                db.close()
        except Exception as e:
            logger.debug(f"DB presence update bypassed: {e}")

# Global Singleton Manager
ws_manager = ConnectionManager()
