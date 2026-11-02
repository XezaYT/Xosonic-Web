export interface Track {
  id: string;
  title: string;
  artist: string;
  durationSeconds: number;
  thumbnailUrl?: string;
  streamUrl?: string;
  isLocal?: boolean;
}

export interface LyricLine {
  timeMs: number;
  text: string;
}

export interface RadarStats {
  totalActiveListeners: number;
  activeRooms: number;
  totalStreamsServed: number;
  topTrending: {
    trackId: string;
    title: string;
    artist: string;
    listeners: number;
  }[];
  timestamp: number;
}
