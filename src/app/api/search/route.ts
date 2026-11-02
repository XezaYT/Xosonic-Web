import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const query = q.trim();
  const tracks: any[] = [];

  // 1. Full-Length Direct YouTube Search Scraper
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/(?:var\s+ytInitialData\s*=\s*|window\["ytInitialData"\]\s*=\s*)({[\s\S]*?});<\/script>/);

      if (match && match[1]) {
        try {
          const data = JSON.parse(match[1]);
          const contents =
            data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
              ?.itemSectionRenderer?.contents || [];

          for (const item of contents) {
            const vr = item.videoRenderer;
            if (vr && vr.videoId) {
              const vid = vr.videoId;
              const title = vr.title?.runs?.[0]?.text || 'Unknown Title';
              const artist = vr.ownerText?.runs?.[0]?.text || 'Unknown Artist';
              const timeStr = vr.lengthText?.simpleText || '';

              let durationSecs = 180;
              if (timeStr) {
                const parts = timeStr.split(':').map(Number);
                if (parts.length === 3) durationSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
                else if (parts.length === 2) durationSecs = parts[0] * 60 + parts[1];
              }

              // Extract best thumbnail
              const thumbs = vr.thumbnail?.thumbnails || [];
              const bestThumb = thumbs.length > 0
                ? thumbs[thumbs.length - 1].url.replace(/^http:/, 'https:')
                : `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;

              tracks.push({
                id: vid,
                title,
                artist,
                album: 'Full Track',
                durationSeconds: durationSecs,
                thumbnailUrl: bestThumb,
                source: 'youtube',
              });
            }
          }
        } catch (jsonErr) {
          console.error('Error parsing ytInitialData JSON:', jsonErr);
        }
      }
    }
  } catch (err) {
    console.error('YouTube search fetch failed:', err);
  }

  // 2. Fallback to Invidious search if YouTube search returned 0 items
  if (tracks.length === 0) {
    const invidiousInstances = [
      'https://yt.artemislena.eu',
      'https://invidious.private.coffee',
      'https://invidious.fi',
    ];

    for (const inst of invidiousInstances) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Xosonic-Web/2.0 (XrLabs)' },
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const items = (data || []).slice(0, 20).map((item: any) => ({
            id: item.videoId,
            title: item.title,
            artist: item.author,
            album: 'Full Track',
            durationSeconds: item.lengthSeconds || 180,
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
