import { NextResponse } from 'next/server';

export const runtime = 'edge';

const PUBLIC_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacy.com.de',
  'https://piped-api.lunar.icu',
  'https://api.piped.projectsegfau.lt',
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  for (const instance of PUBLIC_INSTANCES) {
    try {
      const res = await fetch(`${instance}/search?q=${encodeURIComponent(q)}&filter=music_songs`, {
        headers: { 'User-Agent': 'Xosonic-Web/1.0 (XrLabs)' },
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const items = (data.items || [])
        .filter((i: any) => i.type === 'stream')
        .slice(0, 20)
        .map((i: any) => {
          const id = i.url ? i.url.replace('/watch?v=', '') : '';
          return {
            id,
            title: i.title || 'Unknown Title',
            artist: i.uploaderName || 'Unknown Artist',
            durationSeconds: i.duration || 0,
            thumbnailUrl: i.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          };
        });

      return NextResponse.json({ tracks: items });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ tracks: [] });
}
