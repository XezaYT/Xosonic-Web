import { NextResponse } from 'next/server';

export const runtime = 'edge';

const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://yt.artemislena.eu',
  'https://invidious.private.coffee',
  'https://inv.tux.pizza',
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  // If already an itunes id or non-youtube id, return standard response
  if (id.startsWith('itunes-') || id.startsWith('local-')) {
    return NextResponse.json({ error: 'Local or direct stream' }, { status: 400 });
  }

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${instance}/api/v1/videos/${id}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Xosonic-Web/2.0 (XrLabs)' },
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      const adaptiveFormats = data.adaptiveFormats || [];
      const audioStreams = adaptiveFormats.filter((f: any) =>
        f.type && f.type.startsWith('audio/')
      );

      if (audioStreams.length > 0) {
        audioStreams.sort((a: any, b: any) => (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0));
        const best = audioStreams[0];
        return NextResponse.json({
          streamUrl: best.url,
          bitrate: best.bitrate,
          container: best.container,
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: 'Stream could not be resolved' }, { status: 404 });
}
