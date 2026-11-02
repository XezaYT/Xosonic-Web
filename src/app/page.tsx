"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Search,
  Upload,
  Radio,
  FileAudio,
  Download,
  Share2,
  Sparkles,
  Heart,
  Music,
  ListMusic,
  Home as HomeIcon,
  Library as LibraryIcon,
  Repeat,
  Repeat1,
  Shuffle,
  Plus,
  Trash2,
  X,
  Disc3,
  Smartphone,
  Apple,
  Bot,
  Flame,
  Check,
  FolderPlus,
  Video
} from "lucide-react";
import type { Track, LyricLine, Playlist } from "@/types";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Curated full-length master tracks with verified IDs & high-res artwork
const CURATED_FULL_TRACKS: Track[] = [
  {
    id: "6uaq8GJJxAQ",
    title: "SugarCrash! (Official Video)",
    artist: "ElyOtto",
    album: "Full Track",
    durationSeconds: 81,
    thumbnailUrl: "https://i.ytimg.com/vi/6uaq8GJJxAQ/hqdefault.jpg",
    source: "youtube",
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night At The Opera",
    durationSeconds: 355,
    thumbnailUrl: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
    source: "youtube",
  },
  {
    id: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    durationSeconds: 260,
    thumbnailUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    source: "youtube",
  },
  {
    id: "Zi_XLOBDo_Y",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    durationSeconds: 295,
    thumbnailUrl: "https://i.ytimg.com/vi/Zi_XLOBDo_Y/hqdefault.jpg",
    source: "youtube",
  },
  {
    id: "5NV6Rdv1a3I",
    title: "Get Lucky",
    artist: "Daft Punk ft. Pharrell Williams",
    album: "Random Access Memories",
    durationSeconds: 248,
    thumbnailUrl: "https://i.ytimg.com/vi/5NV6Rdv1a3I/hqdefault.jpg",
    source: "youtube",
  },
  {
    id: "TUVcZfQe-Kw",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    durationSeconds: 203,
    thumbnailUrl: "https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg",
    source: "youtube",
  },
  {
    id: "dvgZkm1xWPE",
    title: "Viva La Vida",
    artist: "Coldplay",
    album: "Viva La Vida",
    durationSeconds: 242,
    thumbnailUrl: "https://i.ytimg.com/vi/dvgZkm1xWPE/hqdefault.jpg",
    source: "youtube",
  },
  {
    id: "7wtfhZwyrcc",
    title: "Believer",
    artist: "Imagine Dragons",
    album: "Evolve",
    durationSeconds: 216,
    thumbnailUrl: "https://i.ytimg.com/vi/7wtfhZwyrcc/hqdefault.jpg",
    source: "youtube",
  },
];

const GENRES = [
  { name: "Top Hits", query: "pop hits 2024" },
  { name: "Rock & Classics", query: "rock classics queen acdc" },
  { name: "Synthwave & Cyber", query: "synthwave electronic retro" },
  { name: "Hip-Hop & R&B", query: "hip hop drake kendrick" },
  { name: "Chill & Lo-Fi", query: "lofi hip hop chill beats" },
  { name: "Electronic & EDM", query: "electronic dance edm avicii" },
];

export default function Home() {
  // Navigation
  const [currentNav, setCurrentNav] = useState<"home" | "discover" | "library">("home");
  const [libraryTab, setLibraryTab] = useState<"favorites" | "playlists" | "local">("favorites");
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0].name);

  // Tracks & Playback State
  const [tracks, setTracks] = useState<Track[]>(CURATED_FULL_TRACKS);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>(CURATED_FULL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(CURATED_FULL_TRACKS[0].durationSeconds);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("all");
  const [isShuffle, setIsShuffle] = useState(false);

  // Play Queue
  const [queue, setQueue] = useState<Track[]>(CURATED_FULL_TRACKS);
  const [queueIndex, setQueueIndex] = useState(0);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  // Live Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Real Active Presence
  const [activeListeners, setActiveListeners] = useState(1);
  const clientIdRef = useRef<string>("");

  // Synced Lyrics
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [showLyricsDrawer, setShowLyricsDrawer] = useState(false);

  // User Library & Storage
  const [favorites, setFavorites] = useState<Map<string, Track>>(new Map());
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);

  // Modals & Feedback
  const [showDownloadsModal, setShowDownloadsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [showVideo, setShowVideo] = useState(false);
  const pendingTrackRef = useRef<Track | null>(null);
  const handleNextRef = useRef<() => void>(() => {});

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isYTReady, setIsYTReady] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Initialize Client & Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      let cid = sessionStorage.getItem("xosonic_client_id");
      if (!cid) {
        cid = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("xosonic_client_id", cid);
      }
      clientIdRef.current = cid;

      try {
        const savedFavs = localStorage.getItem("xosonic_favorites_data");
        if (savedFavs) {
          const arr: Track[] = JSON.parse(savedFavs);
          const map = new Map<string, Track>();
          arr.forEach((t) => map.set(t.id, t));
          setFavorites(map);
        }
      } catch {}

      try {
        const savedPlaylists = localStorage.getItem("xosonic_playlists_data");
        if (savedPlaylists) {
          setPlaylists(JSON.parse(savedPlaylists));
        } else {
          const starter: Playlist = {
            id: "starter_vibes",
            name: "Cyber Vibes",
            description: "Default curated sound selection",
            trackIds: [],
            createdAt: Date.now(),
          };
          setPlaylists([starter]);
          localStorage.setItem("xosonic_playlists_data", JSON.stringify([starter]));
        }
      } catch {}
    }
  }, []);

  // 2. Setup Full-Length YouTube Audio Engine
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initYT = () => {
      if (window.YT && window.YT.Player && !ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player("youtube-player-container", {
          height: "100%",
          width: "100%",
          videoId: pendingTrackRef.current?.id || CURATED_FULL_TRACKS[0].id,
          playerVars: {
            autoplay: pendingTrackRef.current ? 1 : 0,
            controls: 1,
            disablekb: 0,
            fs: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              setIsYTReady(true);
              if (pendingTrackRef.current) {
                event.target.loadVideoById(pendingTrackRef.current.id);
                event.target.playVideo();
                setIsPlaying(true);
                pendingTrackRef.current = null;
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                handleNextRef.current?.();
              }
            },
            onError: (event: any) => {
              console.warn("YouTube player error:", event.data);
              showToast("Track unavailable, skipping to next track");
              handleNextRef.current?.();
            },
          },
        });
      }
    };

    window.onYouTubeIframeAPIReady = initYT;
    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 3. Real Presence Heartbeat
  useEffect(() => {
    const sendPresence = async () => {
      if (!clientIdRef.current) return;
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: clientIdRef.current,
            isPlaying,
            trackTitle: currentTrack?.title,
            artist: currentTrack?.artist,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.activeListeners !== undefined) setActiveListeners(data.activeListeners);
        }
      } catch {}
    };

    sendPresence();
    const interval = setInterval(sendPresence, 15000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // 4. Scrubber & Time Sync Loop (Full Length)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (currentTrack?.isLocal) {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setDuration(audioRef.current.duration || 0);
        }
      } else if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
        try {
          const curr = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || currentTrack?.durationSeconds || 0;
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
        } catch {}
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // 5. Playback Controller (Full Song)
  const playTrack = useCallback(async (track: Track, newQueue?: Track[], index?: number) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.durationSeconds || 180);

    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(index !== undefined ? index : 0);
    }

    if (track.isLocal) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        ytPlayerRef.current.pauseVideo();
      }
      if (audioRef.current && track.streamUrl) {
        audioRef.current.src = track.streamUrl;
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      if (audioRef.current) audioRef.current.pause();
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
        ytPlayerRef.current.loadVideoById(track.id);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } else {
        pendingTrackRef.current = track;
      }
    }

    fetchLyrics(track.title, track.artist);
  }, []);

  const togglePlayPause = () => {
    if (currentTrack?.isLocal) {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else if (ytPlayerRef.current) {
      if (isPlaying) {
        if (typeof ytPlayerRef.current.pauseVideo === "function") ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        if (typeof ytPlayerRef.current.playVideo === "function") ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    if (repeatMode === "one") {
      seek(0);
      togglePlayPause();
      return;
    }

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "all") nextIndex = 0;
      else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIndex);
    playTrack(queue[nextIndex]);
  }, [queue, queueIndex, repeatMode, playTrack]);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const handlePrev = useCallback(() => {
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const prevIndex = queueIndex - 1 >= 0 ? queueIndex - 1 : queue.length - 1;
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex]);
  }, [currentTime, queue, queueIndex, playTrack]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seek(Math.min(duration, currentTime + 5));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seek(Math.max(0, currentTime - 5));
      } else if (e.key === "l" || e.key === "L") {
        setShowLyricsDrawer((prev) => !prev);
      } else if (e.key === "v" || e.key === "V") {
        setShowVideo((prev) => !prev);
      } else if (e.key === "m" || e.key === "M") {
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentTime, duration, isMuted, volume]);

  const seek = (time: number) => {
    setCurrentTime(time);
    if (currentTrack?.isLocal) {
      if (audioRef.current) audioRef.current.currentTime = time;
    } else if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
      ytPlayerRef.current.seekTo(time, true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = volume;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.unMute === "function") {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(Math.round(volume * 100));
      }
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.mute === "function") {
        ytPlayerRef.current.mute();
      }
    }
  };

  // 6. Live Genre Selector
  const selectGenre = async (genreName: string, query: string) => {
    setSelectedGenre(genreName);
    setLoadingTracks(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        setTracks(data.tracks);
        setQueue(data.tracks);
        setQueueIndex(0);
      }
    } catch {} finally {
      setLoadingTracks(false);
    }
  };

  // 7. Live Spectrum Visualizer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(20);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        const time = Date.now() / 150;
        for (let i = 0; i < 20; i++) {
          dataArray[i] = Math.max(12, Math.sin(time + i * 0.45) * 80 + Math.cos(time * 0.8) * 45 + 50);
        }
      } else {
        for (let i = 0; i < 20; i++) dataArray[i] = 4;
      }

      const barWidth = 4;
      const gap = 3;
      const totalWidth = 20 * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < 20; i++) {
        const val = dataArray[i];
        const barHeight = Math.max(2, (val / 255) * canvas.height);
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - barHeight;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "rgba(142, 202, 230, 0.3)");
        gradient.addColorStop(1, "rgba(142, 202, 230, 0.95)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    render();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // 8. Synced Lyrics Fetcher
  const fetchLyrics = async (title: string, artist: string) => {
    setLoadingLyrics(true);
    setLyrics([]);
    try {
      const res = await fetch(`/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
      const data = await res.json();
      if (data.lyrics) {
        parseLrc(data.lyrics);
      }
    } catch {
      setLyrics([]);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const parseLrc = (lrcString: string) => {
    const lines = lrcString.split("\n");
    const parsed: LyricLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/;

    for (const line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, "0"), 10) : 0;
        const totalMs = (minutes * 60 + seconds) * 1000 + ms;
        const text = line.replace(timeRegex, "").trim();
        if (text) parsed.push({ timeMs: totalMs, text });
      }
    }
    setLyrics(parsed);
  };

  const activeLyricIndex = useMemo(() => {
    const currentMs = currentTime * 1000;
    let active = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].timeMs <= currentMs) active = i;
      else break;
    }
    return active;
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeLyricIndex]);

  // 9. Full-Length Search Input
  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        setSearchResults(data.tracks || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  // 10. Local Audio Uploader
  const handleLocalAudioUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newTracks: Track[] = Array.from(files)
      .filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|ogg)$/i.test(f.name))
      .map((file, idx) => ({
        id: `local-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Audio File",
        album: "Local Storage",
        durationSeconds: 0,
        streamUrl: URL.createObjectURL(file),
        isLocal: true,
        source: "local",
        thumbnailUrl: "/logo.png",
      }));

    if (newTracks.length > 0) {
      setLocalTracks((prev) => [...newTracks, ...prev]);
      setQueue((prev) => [...prev, ...newTracks]);
      playTrack(newTracks[0]);
      showToast(`Added ${newTracks.length} local track(s)`);
    }
  };

  // Favorites & Playlists
  const toggleFavorite = (track: Track) => {
    setFavorites((prev) => {
      const next = new Map(prev);
      if (next.has(track.id)) {
        next.delete(track.id);
        showToast("Removed from Liked Songs");
      } else {
        next.set(track.id, track);
        showToast("Saved to Liked Songs");
      }
      localStorage.setItem("xosonic_favorites_data", JSON.stringify(Array.from(next.values())));
      return next;
    });
  };

  const createPlaylist = () => {
    if (!newPlaylistTitle.trim()) return;
    const newPl: Playlist = {
      id: `pl_${Date.now()}`,
      name: newPlaylistTitle.trim(),
      trackIds: trackToAddToPlaylist ? [trackToAddToPlaylist.id] : [],
      createdAt: Date.now(),
    };

    const updated = [...playlists, newPl];
    setPlaylists(updated);
    localStorage.setItem("xosonic_playlists_data", JSON.stringify(updated));
    setNewPlaylistTitle("");
    setShowCreatePlaylistModal(false);
    setTrackToAddToPlaylist(null);
    showToast(`Created playlist "${newPl.name}"`);
  };

  const addTrackToPlaylist = (plId: string, track: Track) => {
    const updated = playlists.map((pl) => {
      if (pl.id === plId) {
        if (!pl.trackIds.includes(track.id)) {
          return { ...pl, trackIds: [...pl.trackIds, track.id] };
        }
      }
      return pl;
    });
    setPlaylists(updated);
    localStorage.setItem("xosonic_playlists_data", JSON.stringify(updated));
    setTrackToAddToPlaylist(null);
    showToast("Added to playlist");
  };

  const deletePlaylist = (plId: string) => {
    const updated = playlists.filter((p) => p.id !== plId);
    setPlaylists(updated);
    localStorage.setItem("xosonic_playlists_data", JSON.stringify(updated));
    showToast("Playlist deleted");
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleLocalAudioUpload(e.dataTransfer.files);
      }}
      className="min-h-screen bg-m3-background text-m3-onSurface flex flex-col md:flex-row relative selection:bg-m3-primary/30 selection:text-m3-onPrimaryContainer font-sans"
    >
      {/* Dynamic Video / Background Audio Container */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          showVideo
            ? "bottom-24 right-4 sm:right-6 w-80 h-48 sm:w-96 sm:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black/95 pointer-events-auto"
            : "bottom-1 right-1 w-2 h-2 opacity-[0.02] pointer-events-none overflow-hidden z-0"
        }`}
      >
        {showVideo && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
            <span className="text-[10px] font-mono bg-black/75 px-2 py-0.5 rounded-full text-white/90 backdrop-blur-md">
              Live Video Stream
            </span>
            <button
              onClick={() => setShowVideo(false)}
              className="p-1.5 rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md transition"
              title="Minimize to Audio"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div id="youtube-player-container" className="w-full h-full" />
      </div>

      {/* Real HTML5 Audio Player for Local Files */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={handleNext}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleLocalAudioUpload(e.target.files)}
        multiple
        accept="audio/*,.mp3,.wav,.flac,.m4a"
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 liquid-glass rounded-full px-5 py-2.5 border border-m3-primary/40 shadow-2xl flex items-center gap-2 text-xs font-semibold text-white animate-fadeIn">
          <Check className="w-4 h-4 text-m3-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT NAVIGATION RAIL (Editorial Craftsmanship)          */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col items-center justify-between w-20 lg:w-60 bg-m3-surface border-r border-white/5 py-6 px-3 z-30 select-none">
        <div className="flex flex-col items-center lg:items-start w-full">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="relative w-10 h-10 rounded-2xl liquid-glass flex items-center justify-center p-1 border border-m3-primary/30 shadow-lg shadow-m3-primary/10">
              <img
                src="/logo.png"
                alt="Xosonic"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/favicon.ico";
                }}
              />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                Xosonic
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-m3-primaryContainer text-m3-onPrimaryContainer">
                  XrLabs
                </span>
              </h1>
              <p className="text-[10px] text-m3-onSurfaceVariant">Full-Length Audio</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 w-full mt-8">
            <button
              onClick={() => {
                setCurrentNav("home");
                setHasSearched(false);
              }}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                currentNav === "home" && !hasSearched
                  ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-bold"
                  : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="hidden lg:block text-xs">Home</span>
            </button>

            <button
              onClick={() => {
                setCurrentNav("discover");
                setHasSearched(false);
              }}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                currentNav === "discover"
                  ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-bold"
                  : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
              }`}
            >
              <Flame className="w-5 h-5" />
              <span className="hidden lg:block text-xs">Discover</span>
            </button>

            <button
              onClick={() => {
                setCurrentNav("library");
                setHasSearched(false);
              }}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                currentNav === "library"
                  ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-bold"
                  : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
              }`}
            >
              <LibraryIcon className="w-5 h-5" />
              <span className="hidden lg:block text-xs">My Library</span>
            </button>

            <button
              onClick={() => setShowQueueDrawer(true)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white transition"
            >
              <div className="relative">
                <ListMusic className="w-5 h-5" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-m3-primary text-m3-onPrimary text-[9px] font-bold flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-xs">Play Queue</span>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 w-full pt-4 border-t border-white/5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl liquid-glass-pill text-xs text-m3-onSurfaceVariant hover:text-white w-full"
            title="Import Local Audio Files"
          >
            <Upload className="w-4 h-4 text-m3-primary" />
            <span className="hidden lg:block font-medium">Add Local Files</span>
          </button>

          <button
            onClick={() => setShowDownloadsModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-m3-primary/10 border border-m3-primary/20 text-xs text-m3-primary hover:bg-m3-primary/20 w-full font-bold"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:block">Apps & Bot</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLLABLE DASHBOARD CANVAS                       */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-36">
        {/* Top Header with Real Active Presence & Search */}
        <header className="sticky top-0 z-20 liquid-glass border-b border-white/5 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <img src="/logo.png" alt="Xosonic" className="w-7 h-7 object-contain" />
            <span className="font-extrabold text-sm tracking-tight text-white">Xosonic</span>
          </div>

          {/* Interactive Instant Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-m3-onSurfaceVariant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search any full-length song, artist, or album..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-m3-surfaceContainer text-xs text-white placeholder-m3-onSurfaceVariant/60 border border-transparent focus:border-m3-primary/50 focus:bg-m3-surfaceContainerHigh focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setHasSearched(false);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* REAL ACTIVE PLAYERS TELEMETRY */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-pill border border-emerald-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-mono font-bold">{activeListeners}</span>
              <span className="text-m3-onSurfaceVariant text-[11px] hidden sm:inline">
                {activeListeners === 1 ? "player active" : "players active"}
              </span>
            </div>

            <button
              onClick={() => setShowDownloadsModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-m3-primary/10 border border-m3-primary/30 text-xs font-semibold text-m3-primary hover:bg-m3-primary/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get APK</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* SEARCH RESULTS VIEW */}
          {hasSearched ? (
            <section className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-m3-primary" />
                    Search Results for &ldquo;{searchQuery}&rdquo;
                  </h2>
                  <p className="text-xs text-m3-onSurfaceVariant">
                    {isSearching ? "Searching full-length songs..." : `${searchResults.length} full-length tracks found`}
                  </p>
                </div>
              </div>

              {isSearching ? (
                <div className="py-20 text-center text-xs text-m3-onSurfaceVariant">
                  <div className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mx-auto mb-3" />
                  Resolving full-length tracks...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {searchResults.map((track) => {
                    const isSelected = currentTrack?.id === track.id;
                    const isFav = favorites.has(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track, [track, ...queue])}
                        className={`p-3 rounded-2xl liquid-glass-card cursor-pointer group border flex items-center gap-3.5 ${
                          isSelected
                            ? "border-m3-primary/60 bg-m3-surfaceContainerHigh"
                            : "border-white/5 hover:border-m3-primary/30"
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-m3-surfaceContainer">
                          <img
                            src={track.thumbnailUrl || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/logo.png";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? "text-m3-primary" : "text-white"}`}>
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-m3-onSurfaceVariant truncate mt-0.5">
                            {track.artist}
                          </p>
                          <span className="text-[10px] text-m3-onSurfaceVariant/60 font-mono">
                            {formatTime(track.durationSeconds)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTrackToAddToPlaylist(track);
                            }}
                            className="p-1.5 rounded-full hover:bg-white/10 text-m3-onSurfaceVariant hover:text-white"
                            title="Add to Playlist"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(track);
                            }}
                            className="p-1.5 rounded-full hover:bg-white/10"
                            title="Favorite"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFav ? "text-m3-favorite fill-m3-favorite" : "text-m3-onSurfaceVariant"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 rounded-3xl liquid-glass text-center text-xs text-m3-onSurfaceVariant">
                  No matching tracks found. Try searching by song name or artist.
                </div>
              )}
            </section>
          ) : currentNav === "discover" ? (
            /* DISCOVER VIEW */
            <section className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Flame className="w-6 h-6 text-m3-primary" />
                  Explore Sound Genres
                </h2>
                <p className="text-xs text-m3-onSurfaceVariant mt-0.5">
                  Full-length tracks updated across global sound channels
                </p>
              </div>

              {/* Genre Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {GENRES.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => selectGenre(g.name, g.query)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      selectedGenre === g.name
                        ? "bg-m3-primary text-m3-onPrimary shadow-lg shadow-m3-primary/20"
                        : "bg-m3-surfaceContainer hover:bg-m3-surfaceContainerHigh text-m3-onSurfaceVariant hover:text-white"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              {/* Genre Tracks Grid */}
              {loadingTracks ? (
                <div className="py-20 text-center text-xs text-m3-onSurfaceVariant">
                  <div className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mx-auto mb-3" />
                  Loading genre tracks...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {tracks.map((track, idx) => {
                    const isSelected = currentTrack?.id === track.id;
                    const isFav = favorites.has(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track, tracks, idx)}
                        className={`p-3 rounded-2xl liquid-glass-card cursor-pointer group border flex items-center gap-3.5 ${
                          isSelected
                            ? "border-m3-primary/60 bg-m3-surfaceContainerHigh"
                            : "border-white/5 hover:border-m3-primary/30"
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-m3-surfaceContainer">
                          <img
                            src={track.thumbnailUrl || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                            alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/logo.png";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? "text-m3-primary" : "text-white"}`}>
                            {track.title}
                          </h4>
                          <p className="text-[11px] text-m3-onSurfaceVariant truncate mt-0.5">
                            {track.artist}
                          </p>
                          <span className="text-[10px] text-m3-onSurfaceVariant/60 font-mono">
                            {formatTime(track.durationSeconds)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(track);
                          }}
                          className="p-1.5 rounded-full hover:bg-white/10"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav ? "text-m3-favorite fill-m3-favorite" : "text-m3-onSurfaceVariant"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : currentNav === "library" ? (
            /* LIBRARY VIEW */
            <section className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <LibraryIcon className="w-6 h-6 text-m3-primary" />
                    My Sound Library
                  </h2>
                  <p className="text-xs text-m3-onSurfaceVariant mt-0.5">
                    Your saved favorites, custom playlists, and local files
                  </p>
                </div>

                <button
                  onClick={() => setShowCreatePlaylistModal(true)}
                  className="px-4 py-2 rounded-full bg-m3-primary text-m3-onPrimary text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-m3-primary/20 hover:scale-105 transition"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>New Playlist</span>
                </button>
              </div>

              {/* Library Navigation Tabs */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                <button
                  onClick={() => setLibraryTab("favorites")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    libraryTab === "favorites"
                      ? "bg-m3-primary text-m3-onPrimary"
                      : "text-m3-onSurfaceVariant hover:text-white"
                  }`}
                >
                  Liked Songs ({favorites.size})
                </button>
                <button
                  onClick={() => setLibraryTab("playlists")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    libraryTab === "playlists"
                      ? "bg-m3-primary text-m3-onPrimary"
                      : "text-m3-onSurfaceVariant hover:text-white"
                  }`}
                >
                  Playlists ({playlists.length})
                </button>
                <button
                  onClick={() => setLibraryTab("local")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    libraryTab === "local"
                      ? "bg-m3-primary text-m3-onPrimary"
                      : "text-m3-onSurfaceVariant hover:text-white"
                  }`}
                >
                  Local Audio ({localTracks.length})
                </button>
              </div>

              {/* LIKED SONGS TAB */}
              {libraryTab === "favorites" && (
                <div>
                  {favorites.size > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {Array.from(favorites.values()).map((track) => (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track, Array.from(favorites.values()))}
                          className="p-3 rounded-2xl liquid-glass-card border border-white/5 hover:border-m3-primary/30 flex items-center gap-3.5 cursor-pointer group"
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-m3-surfaceContainer">
                            <img
                              src={track.thumbnailUrl || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                              alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              onError={(e) => {
                                e.currentTarget.src = "/logo.png";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                            <p className="text-[11px] text-m3-onSurfaceVariant truncate mt-0.5">{track.artist}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(track);
                            }}
                            className="p-1.5 text-m3-favorite"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-16 rounded-3xl liquid-glass text-center text-xs text-m3-onSurfaceVariant">
                      <Heart className="w-8 h-8 text-m3-favorite mx-auto mb-2 opacity-60" />
                      No liked songs yet. Tap the heart on any track to save it here!
                    </div>
                  )}
                </div>
              )}

              {/* PLAYLISTS TAB */}
              {libraryTab === "playlists" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className="p-5 rounded-2xl liquid-glass border border-white/5 hover:border-m3-primary/30 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-m3-primaryContainer text-m3-onPrimaryContainer flex items-center justify-center">
                            <ListMusic className="w-5 h-5" />
                          </div>
                          <button
                            onClick={() => deletePlaylist(pl.id)}
                            className="p-1.5 text-white/40 hover:text-rose-400 transition"
                            title="Delete Playlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{pl.name}</h4>
                          <p className="text-xs text-m3-onSurfaceVariant mt-0.5">
                            {pl.trackIds.length} track(s)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LOCAL AUDIO TAB */}
              {libraryTab === "local" && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-10 border-2 border-dashed border-m3-primary/30 hover:border-m3-primary/60 rounded-3xl liquid-glass text-center cursor-pointer transition group"
                  >
                    <Upload className="w-8 h-8 text-m3-primary mx-auto mb-2 group-hover:scale-110 transition" />
                    <h4 className="text-sm font-bold text-white">Click or drag local files here</h4>
                    <p className="text-xs text-m3-onSurfaceVariant mt-1">
                      Full-length audio playback for .mp3, .wav, .flac, .m4a.
                    </p>
                  </div>

                  {localTracks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {localTracks.map((track) => (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track)}
                          className="p-3 rounded-2xl liquid-glass-card border border-white/5 hover:border-m3-primary/30 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-m3-primaryContainer text-m3-onPrimaryContainer flex items-center justify-center flex-shrink-0">
                              <Music className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                              <p className="text-[10px] text-m3-onSurfaceVariant">Local File</p>
                            </div>
                          </div>
                          <Play className="w-4 h-4 text-m3-primary flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : (
            /* DEFAULT HOME VIEW */
            <>
              {/* Active Hero Track Card */}
              {currentTrack && (
                <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 liquid-glass border border-m3-primary/25 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-fadeIn">
                  <div className="flex items-center gap-5 w-full md:w-auto">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 bg-m3-surfaceContainer">
                      <img
                        src={currentTrack.thumbnailUrl || `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/logo.png";
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                        <Disc3 className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`} />
                        Now Playing (Full Song)
                      </span>
                      <h2 className="text-lg md:text-2xl font-black text-white mt-1 line-clamp-1">
                        {currentTrack.title}
                      </h2>
                      <p className="text-xs md:text-sm text-m3-onSurfaceVariant mt-0.5">
                        {currentTrack.artist} • {currentTrack.album || "Full Track"}
                      </p>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={togglePlayPause}
                          className="px-5 py-2 rounded-full bg-m3-primary text-m3-onPrimary font-bold text-xs flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-m3-primary/25"
                        >
                          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          <span>{isPlaying ? "Pause Track" : "Play Full Song"}</span>
                        </button>

                        <button
                          onClick={() => setShowLyricsDrawer(true)}
                          className="px-4 py-2 rounded-full liquid-glass-pill text-xs font-semibold text-white hover:text-m3-primary transition flex items-center gap-1.5"
                        >
                          <ListMusic className="w-3.5 h-3.5" />
                          <span>Lyrics</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Real Audio Spectrum Visualizer */}
                  <div className="w-full md:w-64 flex flex-col items-center justify-center p-4 rounded-2xl bg-m3-surfaceContainer border border-white/5">
                    <span className="text-[10px] font-semibold text-m3-onSurfaceVariant/80 uppercase tracking-widest mb-2">
                      Live Audio Spectrum
                    </span>
                    <canvas ref={canvasRef} width={180} height={48} className="w-full h-12" />
                    <span className="text-[9px] font-mono text-m3-primary/80 mt-1">
                      {isPlaying ? "Full Stream Active" : "Paused / Ready"}
                    </span>
                  </div>
                </div>
              )}

              {/* CURATED POPULAR MASTER TRACKS */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-m3-primary" />
                      Trending Full-Length Tracks
                    </h3>
                    <p className="text-xs text-m3-onSurfaceVariant">
                      Full songs without demo cuts • High-res artwork
                    </p>
                  </div>
                </div>

                {loadingTracks ? (
                  <div className="py-20 text-center text-xs text-m3-onSurfaceVariant">
                    <div className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mx-auto mb-3" />
                    Loading full-length tracks...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {tracks.map((track, idx) => {
                      const isSelected = currentTrack?.id === track.id;
                      const isFav = favorites.has(track.id);

                      return (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track, tracks, idx)}
                          className={`p-3 rounded-2xl liquid-glass-card cursor-pointer group border flex items-center gap-3.5 ${
                            isSelected
                              ? "border-m3-primary/60 bg-m3-surfaceContainerHigh"
                              : "border-white/5 hover:border-m3-primary/30"
                          }`}
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-m3-surfaceContainer">
                            <img
                              src={track.thumbnailUrl || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                              alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.src = "/logo.png";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold truncate ${isSelected ? "text-m3-primary" : "text-white"}`}>
                              {track.title}
                            </h4>
                            <p className="text-[11px] text-m3-onSurfaceVariant truncate mt-0.5">
                              {track.artist}
                            </p>
                            <span className="text-[10px] text-m3-onSurfaceVariant/60 font-mono">
                              {formatTime(track.durationSeconds)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTrackToAddToPlaylist(track);
                              }}
                              className="p-1.5 rounded-full hover:bg-white/10 text-m3-onSurfaceVariant hover:text-white"
                              title="Add to Playlist"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(track);
                              }}
                              className="p-1.5 rounded-full hover:bg-white/10"
                              title="Favorite"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  isFav ? "text-m3-favorite fill-m3-favorite" : "text-m3-onSurfaceVariant"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. FLOATING HI-FI BOTTOM CONSOLE (Working Full Scrubber)   */}
      {/* ========================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 liquid-glass border-t border-white/10 px-4 py-2.5 backdrop-blur-3xl shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
          {/* Audio Scrubber Progress Line (Full Length) */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] font-mono text-m3-onSurfaceVariant w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-m3-primary"
            />
            <span className="text-[10px] font-mono text-m3-onSurfaceVariant w-10">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 w-1/3">
              {currentTrack && (
                <>
                  <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-m3-surfaceContainer">
                    <img
                      src={currentTrack.thumbnailUrl || `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/logo.png";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                    <p className="text-[11px] text-m3-onSurfaceVariant truncate">{currentTrack.artist}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(currentTrack)}
                    className="hidden sm:block p-1.5 rounded-full hover:bg-white/10 text-m3-onSurfaceVariant"
                    title="Favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.has(currentTrack.id) ? "text-m3-favorite fill-m3-favorite" : ""
                      }`}
                    />
                  </button>
                </>
              )}
            </div>

            {/* Central Transport Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsShuffle((prev) => !prev)}
                className={`hidden sm:block p-2 rounded-full transition ${
                  isShuffle ? "text-m3-primary" : "text-m3-onSurfaceVariant hover:text-white"
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrev}
                className="p-2 text-m3-onSurfaceVariant hover:text-white transition"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-m3-primary text-m3-onPrimary flex items-center justify-center hover:scale-105 transition shadow-lg shadow-m3-primary/30"
                title="Play/Pause (Space)"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2 text-m3-onSurfaceVariant hover:text-white transition"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
                }}
                className={`hidden sm:block p-2 rounded-full transition ${
                  repeatMode !== "off" ? "text-m3-primary" : "text-m3-onSurfaceVariant hover:text-white"
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Right Tools (Volume, Video, Lyrics, Queue) */}
            <div className="flex items-center justify-end gap-2 w-1/3">
              <button
                onClick={() => setShowVideo((prev) => !prev)}
                className={`p-2 rounded-xl transition ${
                  showVideo ? "bg-m3-primary text-m3-onPrimary" : "hover:bg-white/10 text-m3-onSurfaceVariant"
                }`}
                title="Toggle Music Video (V)"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowLyricsDrawer((prev) => !prev)}
                className={`p-2 rounded-xl transition ${
                  showLyricsDrawer ? "bg-m3-primary text-m3-onPrimary" : "hover:bg-white/10 text-m3-onSurfaceVariant"
                }`}
                title="Synchronized Lyrics (L)"
              >
                <ListMusic className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowQueueDrawer((prev) => !prev)}
                className={`p-2 rounded-xl transition relative ${
                  showQueueDrawer ? "bg-m3-primary text-m3-onPrimary" : "hover:bg-white/10 text-m3-onSurfaceVariant"
                }`}
                title="Play Queue (Q)"
              >
                <Disc3 className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-m3-primary text-m3-onPrimary text-[8px] font-bold flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </button>

              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10">
                <button
                  onClick={toggleMute}
                  className="text-m3-onSurfaceVariant hover:text-white"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (audioRef.current) audioRef.current.volume = v;
                    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
                      ytPlayerRef.current.setVolume(Math.round(v * 100));
                    }
                    setIsMuted(false);
                  }}
                  className="w-16 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-m3-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 4. SYNCED LYRICS DRAWER                                   */}
      {/* ========================================================= */}
      {showLyricsDrawer && (
        <div className="fixed bottom-24 right-4 z-50 w-80 md:w-96 max-h-[460px] liquid-glass rounded-3xl p-5 border border-m3-primary/30 shadow-2xl flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Synchronized Lyrics
            </h4>
            <button
              onClick={() => setShowLyricsDrawer(false)}
              className="text-m3-onSurfaceVariant hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 font-medium text-xs no-scrollbar">
            {loadingLyrics ? (
              <p className="text-xs text-m3-onSurfaceVariant text-center py-8">Fetching live lyrics...</p>
            ) : lyrics.length > 0 ? (
              lyrics.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                return (
                  <p
                    key={idx}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => seek(line.timeMs / 1000)}
                    className={`cursor-pointer transition-all duration-300 py-1 ${
                      isActive
                        ? "text-m3-lyricActive font-bold text-sm scale-105"
                        : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-xs text-m3-onSurfaceVariant text-center py-8">
                No synced lyrics found for &ldquo;{currentTrack?.title}&rdquo;.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. INTERACTIVE QUEUE DRAWER                               */}
      {/* ========================================================= */}
      {showQueueDrawer && (
        <div className="fixed bottom-24 right-4 z-50 w-80 md:w-96 max-h-[500px] liquid-glass rounded-3xl p-5 border border-m3-primary/30 shadow-2xl flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-m3-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Play Queue ({queue.length})
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentTrack) setQueue([currentTrack]);
                }}
                className="text-[10px] text-m3-onSurfaceVariant hover:text-rose-400 font-semibold"
              >
                Clear
              </button>
              <button
                onClick={() => setShowQueueDrawer(false)}
                className="text-m3-onSurfaceVariant hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2 no-scrollbar">
            {queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => {
                    setQueueIndex(idx);
                    playTrack(track);
                  }}
                  className={`p-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition ${
                    isCurrent ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-bold" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono w-4 text-center opacity-60">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs truncate">{track.title}</p>
                      <p className="text-[10px] opacity-70 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQueue((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="p-1 text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ADD TO PLAYLIST MODAL                                  */}
      {/* ========================================================= */}
      {trackToAddToPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass rounded-3xl max-w-sm w-full p-6 border border-m3-primary/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Add to Playlist</h4>
              <button
                onClick={() => setTrackToAddToPlaylist(null)}
                className="text-m3-onSurfaceVariant hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-m3-onSurfaceVariant">
              Select a playlist for &ldquo;{trackToAddToPlaylist.title}&rdquo;
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => addTrackToPlaylist(pl.id, trackToAddToPlaylist)}
                  className="w-full p-3 rounded-xl bg-m3-surfaceContainer hover:bg-m3-surfaceContainerHigh text-left text-xs font-semibold text-white flex items-center justify-between transition"
                >
                  <span>{pl.name}</span>
                  <Plus className="w-3.5 h-3.5 text-m3-primary" />
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowCreatePlaylistModal(true);
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-m3-primary/30 text-xs font-semibold text-m3-primary hover:bg-m3-primary/10 transition"
            >
              + Create New Playlist
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. CREATE PLAYLIST MODAL                                  */}
      {/* ========================================================= */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass rounded-3xl max-w-sm w-full p-6 border border-m3-primary/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Create New Playlist</h4>
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="text-m3-onSurfaceVariant hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              placeholder="Playlist title (e.g., Midnight Vibes)"
              className="w-full px-4 py-2.5 rounded-xl bg-m3-surfaceContainer text-xs text-white placeholder-m3-onSurfaceVariant/60 border border-white/10 focus:border-m3-primary focus:outline-none"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                className="flex-1 py-2 rounded-xl bg-m3-primary hover:bg-m3-primary/90 text-xs font-bold text-m3-onPrimary transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. ECOSYSTEM DOWNLOADS MODAL                              */}
      {/* ========================================================= */}
      {showDownloadsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass rounded-3xl max-w-lg w-full p-6 md:p-8 border border-m3-primary/30 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Xosonic" className="w-8 h-8 object-contain" />
                <h3 className="text-base font-bold text-white">Download Xosonic Builds</h3>
              </div>
              <button
                onClick={() => setShowDownloadsModal(false)}
                className="text-m3-onSurfaceVariant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-m3-onSurfaceVariant mb-5">
              Multi-platform music ecosystem engineered by <b>XrLabs</b> • Lead: <code>beatrix.sql</code>
            </p>

            <div className="space-y-3">
              <a
                href="https://github.com/XezaYT/Xosonic/actions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass-card border border-white/5 hover:border-emerald-400/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Universal Android APK</h4>
                    <p className="text-[11px] text-m3-onSurfaceVariant">Signed release APK for all Android devices</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-m3-primary" />
              </a>

              <a
                href="https://github.com/XezaYT/Xosonic-iOS-Lite/actions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass-card border border-white/5 hover:border-blue-400/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">iOS Lite IPA</h4>
                    <p className="text-[11px] text-m3-onSurfaceVariant">3-Song rolling FIFO cache IPA for sideloading</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-m3-primary" />
              </a>

              <a
                href="https://github.com/XezaYT/Xosonic-HyperX"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass-card border border-white/5 hover:border-purple-400/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Discord Voice Bot</h4>
                    <p className="text-[11px] text-m3-onSurfaceVariant">Direct voice streaming & room /sync</p>
                  </div>
                </div>
                <Share2 className="w-4 h-4 text-m3-primary" />
              </a>
            </div>

            <button
              onClick={() => setShowDownloadsModal(false)}
              className="mt-6 w-full py-2.5 rounded-2xl bg-m3-surfaceContainer hover:bg-m3-surfaceContainerHigh text-xs font-bold text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
