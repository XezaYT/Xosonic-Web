import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const artist = searchParams.get('artist') || '';

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      track_name: title,
      artist_name: artist,
    });

    const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      headers: { 'User-Agent': 'Xosonic-Web/1.0 (XrLabs)' },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        synced: !!data.syncedLyrics,
        lyrics: data.syncedLyrics || data.plainLyrics || null,
      });
    }
  } catch {}

  return NextResponse.json({ lyrics: null });
}
