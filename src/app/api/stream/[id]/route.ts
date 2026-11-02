import { NextResponse } from 'next/server';

export const runtime = 'edge';

const PUBLIC_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.privacy.com.de',
  'https://piped-api.lunar.icu',
  'https://api.piped.projectsegfau.lt',
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  for (const instance of PUBLIC_INSTANCES) {
    try {
      const res = await fetch(`${instance}/streams/${id}`, {
        headers: { 'User-Agent': 'Xosonic-Web/1.0 (XrLabs)' },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const audioStreams = data.audioStreams || [];
      if (!audioStreams.length) continue;

      audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
      const best = audioStreams[0];

      return NextResponse.json({
        streamUrl: best.url,
        bitrate: best.bitrate,
        format: best.format,
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: 'Stream could not be resolved' }, { status: 404 });
}
