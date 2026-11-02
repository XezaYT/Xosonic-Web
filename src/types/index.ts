export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  streamUrl?: string;
  isLocal?: boolean;
  source?: 'itunes' | 'youtube' | 'local';
}

export interface LyricLine {
  timeMs: number;
  text: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
}
