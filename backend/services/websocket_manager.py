from typing import Dict, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.clan_rooms: Dict[str, Set[str]] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"User {user_id} connected via WebSocket")
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        print(f"User {user_id} disconnected")
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)
    
    async def join_clan_room(self, user_id: str, clan_id: str):
        if clan_id not in self.clan_rooms:
            self.clan_rooms[clan_id] = set()
        self.clan_rooms[clan_id].add(user_id)
    
    async def leave_clan_room(self, user_id: str, clan_id: str):
        if clan_id in self.clan_rooms:
            self.clan_rooms[clan_id].discard(user_id)
    
    async def broadcast_to_clan(self, clan_id: str, message: dict):
        if clan_id in self.clan_rooms:
            for user_id in self.clan_rooms[clan_id]:
                await self.send_personal_message(message, user_id)
    
    async def notify_user(self, user_id: str, notification_type: str, data: dict):
        """Send a notification to a specific user"""
        message = {
            'type': notification_type,
            'data': data,
            'timestamp': str(datetime.now())
        }
        await self.send_personal_message(message, user_id)
    
    async def notify_clan(self, clan_id: str, notification_type: str, data: dict):
        """Send a notification to all clan members"""
        message = {
            'type': notification_type,
            'data': data,
            'timestamp': str(datetime.now())
        }
        await self.broadcast_to_clan(clan_id, message)

from datetime import datetime
