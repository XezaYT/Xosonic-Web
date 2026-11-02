import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const tracks: any[] = [];

  // 1. Primary: High-speed iTunes API with direct high-quality preview stream & 600x600 artwork
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q.trim())}&entity=song&limit=30`;
    const res = await fetch(itunesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        for (const item of data.results) {
          const highResArt = item.artworkUrl100
            ? item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
            : '/logo.png';

          tracks.push({
            id: `itunes-${item.trackId}`,
            title: item.trackName || 'Unknown Title',
            artist: item.artistName || 'Unknown Artist',
            album: item.collectionName || 'Single',
            durationSeconds: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 180,
            thumbnailUrl: highResArt,
            streamUrl: item.previewUrl || '',
            source: 'itunes',
          });
        }
      }
    }
  } catch (err) {
    console.error('iTunes search error:', err);
  }

  // 2. Secondary fallback if iTunes returned nothing
  if (tracks.length === 0) {
    const invidiousInstances = [
      'https://invidious.nerdvpn.de',
      'https://yt.artemislena.eu',
      'https://invidious.private.coffee',
    ];

    for (const inst of invidiousInstances) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${inst}/api/v1/search?q=${encodeURIComponent(q)}&type=video`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Xosonic-Web/2.0 (XrLabs)' },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const items = (data || []).slice(0, 15).map((item: any) => ({
            id: item.videoId,
            title: item.title,
            artist: item.author,
            durationSeconds: item.lengthSeconds || 0,
            thumbnailUrl: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            source: 'youtube',
          }));

          if (items.length > 0) {
            tracks.push(...items);
            break;
          }
        }
      } catch {}
    }
  }

  return NextResponse.json({ tracks });
}
