"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
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
  ChevronDown,
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
  Check
} from "lucide-react";
import type { Track, LyricLine, Playlist } from "@/types";

// Curated high-fidelity starter tracks with direct AAC streams & high-res artwork
const CURATED_TRACKS: Track[] = [
  {
    id: "itunes-6781024437",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night At The Opera",
    durationSeconds: 355,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/97/ea/bf97ea4f-ebca-57ea-eb75-299f1fa906e1/00602527717462.rgb.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a4/09/a4/a409a473-b2a6-2395-5ad6-4076f7a6f23c/mzaf_7820464627447475305.plus.aac.p.m4a",
    source: "itunes",
  },
  {
    id: "itunes-1440857781",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    durationSeconds: 200,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e52323d8/20UMGIM10589.rgb.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/f4/05/cf/f405cfa2-7c38-23c8-7c85-23c93259b66a/mzaf_10526027003022204641.plus.aac.p.m4a",
    source: "itunes",
  },
  {
    id: "itunes-1440935467",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    durationSeconds: 294,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/28/bf/9b/28bf9b79-e37d-c454-94c6-2f08535a0928/074643811224.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/55/b2/d7/55b2d7ee-c3cf-d5a2-3b0d-2b477b0d9904/mzaf_13506456041130635293.plus.aac.p.m4a",
    source: "itunes",
  },
  {
    id: "itunes-1440854496",
    title: "Get Lucky",
    artist: "Daft Punk ft. Pharrell Williams",
    album: "Random Access Memories",
    durationSeconds: 248,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f9/55/26/f955260c-255e-0466-415d-dc7e90ee928a/886443927087.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/10/7c/36/107c36a4-8494-0196-1c27-ce3c2eeecf77/mzaf_598379435010629579.plus.aac.p.m4a",
    source: "itunes",
  },
  {
    id: "itunes-1538501196",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    durationSeconds: 203,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/08/94/a5/0894a559-0524-7eb3-9799-a477329ecb78/190295286101.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/21/df/f6/21dff6e4-6cb0-b0b3-f09d-cb90728c30c3/mzaf_16405788414574976723.plus.aac.p.m4a",
    source: "itunes",
  },
  {
    id: "itunes-1122780180",
    title: "Viva La Vida",
    artist: "Coldplay",
    album: "Viva La Vida or Death and All His Friends",
    durationSeconds: 242,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/44/2e/76/442e76f0-d9c9-652a-9f5b-1ec44e73bca4/5099968412557.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/f4/1f/43/f41f4350-b0ff-c507-4e6f-fb9495b6a7ee/mzaf_10793666614457788414.plus.aac.p.m4a",
    source: "itunes",
  },
  {
    id: "itunes-1440833215",
    title: "Wake Me Up",
    artist: "Avicii",
    album: "True",
    durationSeconds: 247,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4a/12/37/4a1237a3-5ba8-4c1d-1ba5-eb1281dbd928/00602537535551.rgb.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/ec/3b/b1/ec3bb11d-e593-3bca-c739-2a96a9db3f27/mzaf_10526048560802773223.plus.aac.p.m4a",
    source: "itunes",
  },
  {
    id: "itunes-1440893753",
    title: "Believer",
    artist: "Imagine Dragons",
    album: "Evolve",
    durationSeconds: 204,
    thumbnailUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/36/d4/0b/36d40ba4-8b63-fb52-d179-8260486fa482/17UMGIM86161.rgb.jpg/600x600bb.jpg",
    streamUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/c3/ef/78/c3ef789d-ec12-6804-d47f-82ee1d44c219/mzaf_6132039755866164287.plus.aac.p.m4a",
    source: "itunes",
  },
];

export default function Home() {
  // Navigation: 'home' | 'discover' | 'library' | 'queue'
  const [currentNav, setCurrentNav] = useState<"home" | "discover" | "library" | "queue">("home");

  // Track Playback State
  const [currentTrack, setCurrentTrack] = useState<Track>(CURATED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(CURATED_TRACKS[0].durationSeconds);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("all");
  const [isShuffle, setIsShuffle] = useState(false);

  // Play Queue
  const [queue, setQueue] = useState<Track[]>(CURATED_TRACKS);
  const [queueIndex, setQueueIndex] = useState(0);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Synced Lyrics
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [showLyricsDrawer, setShowLyricsDrawer] = useState(false);

  // User Library & Storage
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);

  // Ecosystem Downloads Modal
  const [showDownloadsModal, setShowDownloadsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Load LocalStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem("xosonic_favs_v2");
      if (savedFavs) setFavorites(new Set(JSON.parse(savedFavs)));

      const savedPlaylists = localStorage.getItem("xosonic_playlists_v2");
      if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));
    } catch {}
  }, []);

  // Save favorites to LocalStorage
  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
        showToast("Removed from Favorites");
      } else {
        next.add(trackId);
        showToast("Saved to Favorites");
      }
      localStorage.setItem("xosonic_favs_v2", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // 2. Web Audio Spectrum Visualizer
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
    } catch {
      // Cross-origin restriction fallback handled below
    }
  }, []);

  // Render visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(32);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else if (isPlaying) {
        // Aesthetic simulated frequency generator when CORS blocks direct MediaElementSource
        const time = Date.now() / 200;
        for (let i = 0; i < 16; i++) {
          dataArray[i] = Math.max(15, Math.sin(time + i * 0.4) * 80 + Math.cos(time * 0.7) * 40 + 60);
        }
      } else {
        // Idle subtle state
        for (let i = 0; i < 16; i++) {
          dataArray[i] = 4;
        }
      }

      const barWidth = 4;
      const gap = 3;
      const totalWidth = 16 * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < 16; i++) {
        const val = dataArray[i];
        const barHeight = Math.max(3, (val / 255) * canvas.height);
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - barHeight;

        // Gradient from M3 primary (#8ECAE6) to glowing electric cyan
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "rgba(142, 202, 230, 0.4)");
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

  // 3. Play Track Handler
  const playTrack = useCallback(async (track: Track, newQueue?: Track[], index?: number) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);

    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(index !== undefined ? index : 0);
    }

    let stream = track.streamUrl;

    // Resolve stream if missing
    if (!stream && !track.isLocal) {
      try {
        const res = await fetch(`/api/stream/${track.id}`);
        const data = await res.json();
        if (data.streamUrl) stream = data.streamUrl;
      } catch {}
    }

    if (audioRef.current && stream) {
      audioRef.current.src = stream;
      audioRef.current.load();
      setupAudioContext();

      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    // Fetch live lyrics
    fetchLyrics(track.title, track.artist);
  }, [setupAudioContext]);

  // Next / Previous Track Controls
  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
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

  const handlePrev = useCallback(() => {
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prevIndex = queueIndex - 1 >= 0 ? queueIndex - 1 : queue.length - 1;
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex]);
  }, [currentTime, queue, queueIndex, playTrack]);

  // Toggle Play / Pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    setupAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Synced Lyrics Loader
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

  // Active lyric tracker
  const activeLyricIndex = useMemo(() => {
    const currentMs = currentTime * 1000;
    let active = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].timeMs <= currentMs) active = i;
      else break;
    }
    return active;
  }, [currentTime, lyrics]);

  // Auto-scroll active lyric
  useEffect(() => {
    if (activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeLyricIndex]);

  // 4. Live Multi-Source Search Execution
  const executeSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term.trim())}`);
      const data = await res.json();
      setSearchResults(data.tracks || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(val);
    }, 400);
  };

  // 5. Drag & Drop and File Picker Local Audio
  const handleLocalAudioUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newTracks: Track[] = Array.from(files)
      .filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|ogg)$/i.test(f.name))
      .map((file, idx) => ({
        id: `local-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Storage Audio",
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
      showToast(`Loaded ${newTracks.length} local track(s)`);
    }
  };

  // Add Track to Queue
  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
    showToast(`Added "${track.title}" to queue`);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === "ArrowLeft") {
        seek(Math.max(0, currentTime - 5));
      } else if (e.code === "ArrowRight") {
        seek(Math.min(duration, currentTime + 5));
      } else if (e.code === "KeyM") {
        setIsMuted((prev) => !prev);
      } else if (e.code === "KeyL") {
        setShowLyricsDrawer((prev) => !prev);
      } else if (e.code === "KeyQ") {
        setShowQueueDrawer((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleLocalAudioUpload(e.dataTransfer.files);
      }}
      className="min-h-screen bg-m3-background text-m3-onSurface flex flex-col md:flex-row relative selection:bg-m3-primary/30 selection:text-m3-onPrimaryContainer font-sans"
    >
      {/* Audio Element */}
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

      {/* Floating Toast Notification */}
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
              <Image src="/logo.png" alt="Xosonic" width={32} height={32} className="object-contain" priority />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Xosonic
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-m3-primaryContainer text-m3-onPrimaryContainer">
                  XrLabs
                </span>
              </h1>
              <p className="text-[10px] text-m3-onSurfaceVariant">Open Sound Engine</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 w-full mt-8">
            <button
              onClick={() => setCurrentNav("home")}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                currentNav === "home"
                  ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-semibold"
                  : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span className="hidden lg:block text-xs">Home</span>
            </button>

            <button
              onClick={() => setCurrentNav("discover")}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                currentNav === "discover"
                  ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-semibold"
                  : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
              }`}
            >
              <Flame className="w-5 h-5" />
              <span className="hidden lg:block text-xs">Discover</span>
            </button>

            <button
              onClick={() => setCurrentNav("library")}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl transition ${
                currentNav === "library"
                  ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-semibold"
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
            className="flex items-center gap-3 px-3 py-2 rounded-xl liquid-glass-pill text-xs text-m3-onSurfaceVariant hover:text-white w-full"
            title="Import Local Audio Files"
          >
            <Upload className="w-4 h-4 text-m3-primary" />
            <span className="hidden lg:block font-medium">Add Local Music</span>
          </button>

          <button
            onClick={() => setShowDownloadsModal(true)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-m3-primary/10 border border-m3-primary/20 text-xs text-m3-primary hover:bg-m3-primary/20 w-full font-semibold"
          >
            <Download className="w-4 h-4" />
            <span className="hidden lg:block">Apps & Bot</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLLABLE DASHBOARD CANVAS                       */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-32">
        {/* Top Header with Real Search */}
        <header className="sticky top-0 z-20 liquid-glass border-b border-white/5 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:hidden">
            <Image src="/logo.png" alt="Xosonic" width={28} height={28} />
            <span className="font-extrabold text-sm tracking-tight text-white">Xosonic</span>
          </div>

          {/* Interactive Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-m3-onSurfaceVariant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search artists, tracks, or paste song name..."
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDownloadsModal(true)}
              className="px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-m3-primary border border-m3-primary/30 hover:bg-m3-primary/10 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get APK / IPA</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* SEARCH RESULTS VIEW (Active when user typed query) */}
          {hasSearched ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-m3-primary" />
                    Search Results for &ldquo;{searchQuery}&rdquo;
                  </h2>
                  <p className="text-xs text-m3-onSurfaceVariant">
                    {isSearching ? "Searching global audio stream network..." : `${searchResults.length} live tracks found`}
                  </p>
                </div>
              </div>

              {isSearching ? (
                <div className="py-16 text-center text-xs text-m3-onSurfaceVariant">
                  <div className="w-8 h-8 rounded-full border-2 border-m3-primary border-t-transparent animate-spin mx-auto mb-3" />
                  Resolving audio streams...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {searchResults.map((track) => {
                    const isSelected = currentTrack.id === track.id;
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
                          <Image
                            src={track.thumbnailUrl || "/logo.png"}
                            alt={track.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            unoptimized
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
                              addToQueue(track);
                            }}
                            className="p-1.5 rounded-full hover:bg-white/10 text-m3-onSurfaceVariant hover:text-white"
                            title="Add to Queue"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(track.id);
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
                  No matching tracks found. Try searching by song title or artist.
                </div>
              )}
            </section>
          ) : (
            /* DEFAULT HOME / DISCOVER VIEW */
            <>
              {/* Active Hero Track Card */}
              <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 liquid-glass border border-m3-primary/20 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 w-full md:w-auto">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0">
                    <Image
                      src={currentTrack.thumbnailUrl || "/logo.png"}
                      alt={currentTrack.title}
                      fill
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-m3-primary flex items-center gap-1.5">
                      <Disc3 className={`w-3.5 h-3.5 ${isPlaying ? "animate-spin" : ""}`} />
                      Currently Loaded
                    </span>
                    <h2 className="text-lg md:text-2xl font-black text-white mt-1 line-clamp-1">
                      {currentTrack.title}
                    </h2>
                    <p className="text-xs md:text-sm text-m3-onSurfaceVariant mt-0.5">
                      {currentTrack.artist} • {currentTrack.album || "Single"}
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={togglePlayPause}
                        className="px-5 py-2 rounded-full bg-m3-primary text-m3-onPrimary font-bold text-xs flex items-center gap-2 hover:scale-105 transition shadow-lg shadow-m3-primary/25"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        <span>{isPlaying ? "Pause Track" : "Play Now"}</span>
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

                {/* Live Real-time Visualizer Deck */}
                <div className="w-full md:w-64 flex flex-col items-center justify-center p-4 rounded-2xl bg-m3-surfaceContainer border border-white/5">
                  <span className="text-[10px] font-semibold text-m3-onSurfaceVariant/80 uppercase tracking-widest mb-2">
                    Audio Spectrum
                  </span>
                  <canvas ref={canvasRef} width={180} height={48} className="w-full h-12" />
                  <span className="text-[9px] font-mono text-m3-primary/80 mt-1">
                    {isPlaying ? "Live Signal Active" : "Standby"}
                  </span>
                </div>
              </div>

              {/* CURATED TRENDING / QUICK PICKS SHELF */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-m3-primary" />
                      Popular Master Tracks
                    </h3>
                    <p className="text-xs text-m3-onSurfaceVariant">
                      Instant high-fidelity streaming • Click any to play
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {CURATED_TRACKS.map((track, idx) => {
                    const isSelected = currentTrack.id === track.id;
                    const isFav = favorites.has(track.id);

                    return (
                      <div
                        key={track.id}
                        onClick={() => playTrack(track, CURATED_TRACKS, idx)}
                        className={`p-3 rounded-2xl liquid-glass-card cursor-pointer group border flex items-center gap-3.5 ${
                          isSelected
                            ? "border-m3-primary/60 bg-m3-surfaceContainerHigh"
                            : "border-white/5 hover:border-m3-primary/30"
                        }`}
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-m3-surfaceContainer">
                          <Image
                            src={track.thumbnailUrl || "/logo.png"}
                            alt={track.title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            unoptimized
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
                              addToQueue(track);
                            }}
                            className="p-1.5 rounded-full hover:bg-white/10 text-m3-onSurfaceVariant hover:text-white"
                            title="Add to Queue"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(track.id);
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
              </section>

              {/* LOCAL AUDIO DROPZONE / LIBRARY */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-m3-primary" />
                      Local Music Library
                    </h3>
                    <p className="text-xs text-m3-onSurfaceVariant">
                      Play your own files directly without uploading to external servers
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-white hover:text-m3-primary transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-m3-primary" />
                    <span>Browse Files</span>
                  </button>
                </div>

                {localTracks.length > 0 ? (
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
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-m3-primary/20 hover:border-m3-primary/50 rounded-3xl liquid-glass text-center cursor-pointer transition"
                  >
                    <Upload className="w-8 h-8 text-m3-primary mx-auto mb-2 opacity-80" />
                    <h4 className="text-sm font-bold text-white">Drag & drop your audio files here</h4>
                    <p className="text-xs text-m3-onSurfaceVariant mt-1">
                      Supports .mp3, .wav, .flac, .m4a. 100% offline and in-browser playback.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. FLOATING HI-FI CONSOLE (Tactile Bottom Dock)           */}
      {/* ========================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 liquid-glass border-t border-white/10 px-4 py-2.5 backdrop-blur-3xl shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] font-mono text-m3-onSurfaceVariant w-8 text-right">
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
            <span className="text-[10px] font-mono text-m3-onSurfaceVariant w-8">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 w-1/3">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-m3-surfaceContainer">
                <Image
                  src={currentTrack.thumbnailUrl || "/logo.png"}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{currentTrack.title}</h4>
                <p className="text-[11px] text-m3-onSurfaceVariant truncate">{currentTrack.artist}</p>
              </div>
              <button
                onClick={() => toggleFavorite(currentTrack.id)}
                className="hidden sm:block p-1.5 rounded-full hover:bg-white/10 text-m3-onSurfaceVariant"
                title="Favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.has(currentTrack.id) ? "text-m3-favorite fill-m3-favorite" : ""
                  }`}
                />
              </button>
            </div>

            {/* Central Controls */}
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

            {/* Right Tools (Volume, Lyrics, Queue) */}
            <div className="flex items-center justify-end gap-2 w-1/3">
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
                  onClick={() => setIsMuted((prev) => !prev)}
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
                No synced lyrics found for &ldquo;{currentTrack.title}&rdquo;.
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
                onClick={() => setQueue([currentTrack])}
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
      {/* 6. ECOSYSTEM DOWNLOADS MODAL                              */}
      {/* ========================================================= */}
      {showDownloadsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass rounded-3xl max-w-lg w-full p-6 md:p-8 border border-m3-primary/30 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Xosonic" width={32} height={32} />
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
