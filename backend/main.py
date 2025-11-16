from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from datetime import datetime
import socketio

from routes import auth, habits, profile, leaderboard, clans, badges, quests, discover
from config import settings

load_dotenv()

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting HABITUATE Backend...")
    print("🔌 Socket.IO server initialized")
    yield
    # Shutdown
    print("👋 Shutting down HABITUATE Backend...")

app = FastAPI(
    title="HABITUATE API",
    description="Gamified Habit Tracking Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(habits.router, prefix="/habits", tags=["Habits"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(clans.router, prefix="/api/clans", tags=["Clans"])
app.include_router(badges.router, prefix="/badges", tags=["Badges"])
app.include_router(quests.router, prefix="/quests", tags=["Quests"])
app.include_router(discover.router, prefix="/discover", tags=["Discover"])

@app.get("/")
async def root():
    return {
        "message": "🎯 HABITUATE API is running!",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth):
    query_string = environ.get('QUERY_STRING', '')
    user_id = None
    
    # Parse query string for user_id
    if 'user_id=' in query_string:
        user_id = query_string.split('user_id=')[1].split('&')[0]
    
    print(f"🔌 Client connected: {sid} (user: {user_id})")
    
    if user_id:
        await sio.save_session(sid, {'user_id': user_id})
    
    await sio.emit('connected', {'sid': sid}, room=sid)

@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get('user_id', 'unknown')
    print(f"❌ Client disconnected: {sid} (user: {user_id})")

@sio.event
async def join_clan_room(sid, data):
    """Join a clan chat room"""
    # Support both camelCase and snake_case
    clan_id = data.get('clanId') or data.get('clan_id')
    user_id = data.get('userId') or data.get('user_id')
    user_name = data.get('userName') or data.get('user_name')
    
    if not clan_id:
        return {'error': 'Clan ID required'}
    
    # Join the room
    await sio.enter_room(sid, f'clan_{clan_id}')
    
    print(f"👥 {user_name} ({sid}) joined clan room: {clan_id}")
    
    # Notify others in the room
    await sio.emit('user_joined_clan', {
        'userId': user_id,
        'userName': user_name,
        'timestamp': datetime.now().isoformat()
    }, room=f'clan_{clan_id}', skip_sid=sid)
    
    return {'success': True, 'room': f'clan_{clan_id}'}

@sio.event
async def leave_clan_room(sid, data):
    """Leave a clan chat room"""
    # Support both camelCase and snake_case
    clan_id = data.get('clanId') or data.get('clan_id')
    user_id = data.get('userId') or data.get('user_id')
    user_name = data.get('userName') or data.get('user_name')
    
    if not clan_id:
        return {'error': 'Clan ID required'}
    
    await sio.leave_room(sid, f'clan_{clan_id}')
    
    print(f"👋 {user_name} ({sid}) left clan room: {clan_id}")
    
    # Notify others in the room
    await sio.emit('user_left_clan', {
        'userId': user_id,
        'userName': user_name,
        'timestamp': datetime.now().isoformat()
    }, room=f'clan_{clan_id}')
    
    return {'success': True}

@sio.event
async def clan_message(sid, data):
    """Handle clan chat message"""
    clan_id = data.get('clanId')
    user_id = data.get('userId')
    user_name = data.get('userName')
    message = data.get('message')
    
    if not all([clan_id, user_id, user_name, message]):
        return {'error': 'Missing required fields'}
    
    # Create message object
    message_data = {
        'id': f"{clan_id}_{datetime.now().timestamp()}",
        'clanId': clan_id,
        'userId': user_id,
        'userName': user_name,
        'message': message,
        'timestamp': datetime.now().isoformat(),
        'avatar': data.get('avatar', '/avatars/default.png')
    }
    
    print(f"💬 Message from {user_name} in clan {clan_id}: {message}")
    
    # Broadcast to all in the room
    await sio.emit('new_clan_message', message_data, room=f'clan_{clan_id}')
    
    return {'success': True, 'message': message_data}

# Wrap FastAPI app with Socket.IO
socket_app = socketio.ASGIApp(
    sio,
    app,
    socketio_path='/socket.io'
)

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:socket_app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
