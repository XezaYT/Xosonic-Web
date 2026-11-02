import { NextResponse } from 'next/server';

interface ActiveSession {
  lastSeen: number;
  trackTitle?: string;
  artist?: string;
  isPlaying: boolean;
}

// In-memory active presence tracker
const sessions = new Map<string, ActiveSession>();

function cleanup() {
  const now = Date.now();
  sessions.forEach((session, id) => {
    if (now - session.lastSeen > 45000) {
      sessions.delete(id);
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, trackTitle, artist, isPlaying } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    sessions.set(clientId, {
      lastSeen: Date.now(),
      trackTitle,
      artist,
      isPlaying: !!isPlaying,
    });

    cleanup();

    let activeListeners = 0;
    const nowPlayingList: { title: string; artist: string }[] = [];

    sessions.forEach((s) => {
      if (s.isPlaying) {
        activeListeners++;
        if (s.trackTitle && s.artist) {
          nowPlayingList.push({ title: s.trackTitle, artist: s.artist });
        }
      }
    });

    return NextResponse.json({
      totalConnected: Math.max(1, sessions.size),
      activeListeners: Math.max(1, activeListeners),
      nowPlaying: nowPlayingList.slice(0, 5),
    });
  } catch {
    return NextResponse.json({
      totalConnected: 1,
      activeListeners: 1,
      nowPlaying: [],
    });
  }
}

export async function GET() {
  cleanup();
  let activeListeners = 0;
  sessions.forEach((s) => {
    if (s.isPlaying) activeListeners++;
  });

  return NextResponse.json({
    totalConnected: Math.max(1, sessions.size),
    activeListeners: Math.max(1, activeListeners),
  });
}
