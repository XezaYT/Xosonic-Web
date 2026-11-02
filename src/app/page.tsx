"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ChevronUp,
  ChevronDown,
  Layers,
  Smartphone,
  Apple,
  Bot,
  Sliders,
  CheckCircle2,
  X
} from "lucide-react";
import type { Track, LyricLine } from "@/types";

// Standard curated starter tracks for instant playback
const INITIAL_PICKS: Track[] = [
  {
    id: "fJ9rUzIMcZQ",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    durationSeconds: 354,
    thumbnailUrl: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Despacito",
    artist: "Luis Fonsi ft. Daddy Yankee",
    durationSeconds: 228,
    thumbnailUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
  },
  {
    id: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    durationSeconds: 233,
    thumbnailUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg",
  },
  {
    id: "OPf0YbXqDm0",
    title: "Uptown Funk",
    artist: "Mark Ronson ft. Bruno Mars",
    durationSeconds: 270,
    thumbnailUrl: "https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg",
  },
  {
    id: "2Vv-BfVoq4g",
    title: "Perfect",
    artist: "Ed Sheeran",
    durationSeconds: 263,
    thumbnailUrl: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg",
  },
  {
    id: "09R8_2nJtjg",
    title: "Sugar",
    artist: "Maroon 5",
    durationSeconds: 235,
    thumbnailUrl: "https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg",
  },
];

const MOOD_CHIPS = [
  "All",
  "Energize",
  "Relax",
  "Focus",
  "Workout",
  "Commute",
  "Party",
  "Local Files",
];

export default function Home() {
  // Navigation Destination: 'home' | 'search' | 'library' | 'radar'
  const [currentNav, setCurrentNav] = useState<"home" | "search" | "library" | "radar">("home");
  const [activeChip, setActiveChip] = useState("All");

  // Search & Results
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>(INITIAL_PICKS);
  const [loading, setLoading] = useState(false);

  // Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_PICKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_PICKS[0].durationSeconds);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["fJ9rUzIMcZQ"]));

  // Full Screen / Expanded Now Playing Sheet
  const [isExpandedPlayer, setIsExpandedPlayer] = useState(false);

  // Synced Lyrics
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);

  // Downloads Modal
  const [showDownloads, setShowDownloads] = useState(false);

  // Active Radar Listeners
  const [activeListeners, setActiveListeners] = useState(48);

  // Local Library Tracks
  const [localTracks, setLocalTracks] = useState<Track[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Time Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Listeners Radar Pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveListeners((prev) => Math.max(16, prev + Math.floor(Math.random() * 5) - 2));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

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
        setShowLyricsPanel((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, isPlaying]);

  // Handle Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setCurrentNav("search");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) {
        setResults(data.tracks);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  };

  // Play Track
  const playTrack = async (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);

    let playUrl = track.streamUrl;

    if (!track.isLocal && !playUrl) {
      try {
        const res = await fetch(`/api/stream/${track.id}`);
        const data = await res.json();
        if (data.streamUrl) {
          playUrl = data.streamUrl;
        }
      } catch (err) {
        console.error("Stream resolution failed", err);
      }
    }

    if (audioRef.current && playUrl) {
      audioRef.current.src = playUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    // Fetch Lyrics
    fetchLyrics(track.title, track.artist);
  };

  // Fetch Lyrics
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

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Local Audio Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: Track[] = Array.from(files).map((file, idx) => ({
      id: `local-${Date.now()}-${idx}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Audio File",
      durationSeconds: 0,
      streamUrl: URL.createObjectURL(file),
      isLocal: true,
      thumbnailUrl: "/logo.png",
    }));

    setLocalTracks((prev) => [...newTracks, ...prev]);
    if (newTracks.length > 0) {
      playTrack(newTracks[0]);
    }
  };

  // Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newTracks: Track[] = Array.from(files)
      .filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|ogg)$/i.test(f.name))
      .map((file, idx) => ({
        id: `local-${Date.now()}-${idx}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: "Local Audio File",
        durationSeconds: 0,
        streamUrl: URL.createObjectURL(file),
        isLocal: true,
        thumbnailUrl: "/logo.png",
      }));

    if (newTracks.length > 0) {
      setLocalTracks((prev) => [...newTracks, ...prev]);
      playTrack(newTracks[0]);
    }
  };

  // Active Lyric calculation
  const activeLyricIndex = useMemo(() => {
    const currentMs = currentTime * 1000;
    let active = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].timeMs <= currentMs) active = i;
      else break;
    }
    return active;
  }, [currentTime, lyrics]);

  // Scroll active lyric into view smoothly
  useEffect(() => {
    if (activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLyricIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Displayed tracks based on currentNav and activeChip
  const displayedTracks = useMemo(() => {
    if (currentNav === "library" || activeChip === "Local Files") {
      return localTracks.length > 0 ? localTracks : results;
    }
    return results;
  }, [currentNav, activeChip, localTracks, results]);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="min-h-screen bg-m3-background text-m3-onSurface flex flex-col md:flex-row relative selection:bg-m3-primary/30 selection:text-m3-onPrimaryContainer"
    >
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setIsPlaying(false)}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept="audio/*,.mp3,.wav,.flac,.m4a"
        className="hidden"
      />

      {/* ========================================================= */}
      {/* 1. DESKTOP NAVIGATION RAIL (Material 3 Expressive)        */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col items-center justify-between w-20 lg:w-64 bg-m3-surface border-r border-white/5 py-6 px-3 z-30 select-none">
        {/* Brand Header */}
        <div className="flex flex-col items-center lg:items-start w-full px-2">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl liquid-glass flex items-center justify-center p-1.5 border border-m3-primary/30 shadow-lg shadow-m3-primary/10">
              <Image
                src="/logo.png"
                alt="Xosonic Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Xosonic
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-m3-primaryContainer text-m3-onPrimaryContainer">
                  XrLabs
                </span>
              </h1>
              <p className="text-[11px] text-m3-onSurfaceVariant">Open Sound Ecosystem</p>
            </div>
          </div>
        </div>

        {/* Navigation Destinations */}
        <nav className="flex flex-col gap-2 w-full mt-8">
          <button
            onClick={() => {
              setCurrentNav("home");
              setActiveChip("All");
            }}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition duration-200 group ${
              currentNav === "home"
                ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-medium"
                : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <HomeIcon className="w-5 h-5" />
            </div>
            <span className="hidden lg:block text-sm">Home</span>
          </button>

          <button
            onClick={() => setCurrentNav("search")}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition duration-200 group ${
              currentNav === "search"
                ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-medium"
                : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <span className="hidden lg:block text-sm">Search</span>
          </button>

          <button
            onClick={() => setCurrentNav("library")}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition duration-200 group ${
              currentNav === "library"
                ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-medium"
                : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <LibraryIcon className="w-5 h-5" />
            </div>
            <span className="hidden lg:block text-sm">Library</span>
          </button>

          <button
            onClick={() => setCurrentNav("radar")}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition duration-200 group ${
              currentNav === "radar"
                ? "bg-m3-primaryContainer text-m3-onPrimaryContainer font-medium"
                : "hover:bg-m3-surfaceContainer text-m3-onSurfaceVariant hover:text-white"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center relative">
              <Radio className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-m3-primary animate-ping" />
            </div>
            <span className="hidden lg:block text-sm">Active Radar</span>
          </button>
        </nav>

        {/* Footer Actions (Upload & Downloads) */}
        <div className="flex flex-col gap-2 w-full pt-4 border-t border-white/5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl liquid-glass-pill text-xs text-m3-onSurfaceVariant hover:text-white w-full"
            title="Import Local Files"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Upload className="w-4 h-4 text-m3-primary" />
            </div>
            <span className="hidden lg:block font-medium">Add Local Files</span>
          </button>

          <button
            onClick={() => setShowDownloads(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-m3-primary/10 border border-m3-primary/30 text-xs text-m3-primary hover:bg-m3-primary/20 w-full"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <span className="hidden lg:block font-semibold">Get Native Apps</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLLABLE CONTENT AREA                           */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-36 md:pb-28">
        {/* Top App Bar with Search & Quick Status */}
        <header className="sticky top-0 z-20 liquid-glass border-b border-white/5 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Mobile Logo Header */}
          <div className="flex items-center gap-2 md:hidden">
            <Image src="/logo.png" alt="Xosonic" width={30} height={30} className="object-contain" />
            <span className="font-bold text-sm tracking-tight text-white">Xosonic</span>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-m3-onSurfaceVariant" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, or paste YouTube link..."
              className="w-full pl-10 pr-10 py-2.5 rounded-full bg-m3-surfaceContainer text-sm text-white placeholder-m3-onSurfaceVariant/60 border border-transparent focus:border-m3-primary/50 focus:bg-m3-surfaceContainerHigh focus:outline-none transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Radar Telemetry Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-pill border border-m3-primary/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 font-medium">{activeListeners} listening now</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Greeting & Mood Chips (HomeScreen Pattern) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  {greeting}
                </h2>
                <p className="text-xs md:text-sm text-m3-onSurfaceVariant mt-0.5">
                  Listen together with seamless edge streaming & synchronized lyrics
                </p>
              </div>

              <button
                onClick={() => setShowDownloads(true)}
                className="md:hidden p-2 rounded-xl liquid-glass text-m3-primary"
                title="Download Apps"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Horizontal Mood Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {MOOD_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(chip)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    activeChip === chip
                      ? "bg-m3-primary text-m3-onPrimary shadow-md shadow-m3-primary/20"
                      : "bg-m3-surfaceContainer hover:bg-m3-surfaceContainerHigh text-m3-onSurfaceVariant hover:text-white"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* VIEW: RADAR VIEW                                          */}
          {/* ========================================================= */}
          {currentNav === "radar" && (
            <div className="liquid-glass-card rounded-3xl p-6 md:p-8 border border-m3-primary/20 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-m3-primary animate-pulse" />
                    HyperX Global Sound Radar
                  </h3>
                  <p className="text-xs text-m3-onSurfaceVariant">
                    Privacy-preserving active telemetry across Discord & Web
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-m3-surfaceContainer border border-white/5">
                  <p className="text-xs text-m3-onSurfaceVariant">Active Listeners</p>
                  <p className="text-2xl font-black text-m3-primary mt-1">{activeListeners}</p>
                </div>
                <div className="p-4 rounded-2xl bg-m3-surfaceContainer border border-white/5">
                  <p className="text-xs text-m3-onSurfaceVariant">Synced Sound Rooms</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">12</p>
                </div>
                <div className="p-4 rounded-2xl bg-m3-surfaceContainer border border-white/5">
                  <p className="text-xs text-m3-onSurfaceVariant">Stream Latency</p>
                  <p className="text-2xl font-black text-purple-400 mt-1">18 ms</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW: LIBRARY / LOCAL AUDIO DROPZONE                      */}
          {/* ========================================================= */}
          {(currentNav === "library" || activeChip === "Local Files") && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-m3-primary/30 hover:border-m3-primary/60 rounded-3xl liquid-glass text-center cursor-pointer transition group"
            >
              <div className="w-16 h-16 rounded-2xl bg-m3-primaryContainer text-m3-onPrimaryContainer flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
                <FileAudio className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Drop local audio tracks here</h3>
              <p className="text-xs text-m3-onSurfaceVariant max-w-md mx-auto mt-1">
                Supports <span className="text-m3-primary">.mp3</span>, <span className="text-m3-primary">.wav</span>, <span className="text-m3-primary">.flac</span>, and <span className="text-m3-primary">.m4a</span>. Click to browse files.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION: QUICK PICKS (Responsive Adaptive Grid)           */}
          {/* ========================================================= */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-m3-primary" />
                Quick Picks
              </h3>
              <span className="text-xs text-m3-onSurfaceVariant">Based on your taste</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {displayedTracks.map((track) => {
                const isSelected = currentTrack?.id === track.id;
                const isFav = favorites.has(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl liquid-glass-card cursor-pointer group border ${
                      isSelected
                        ? "border-m3-primary/60 bg-m3-surfaceContainerHigh"
                        : "border-white/5 hover:border-m3-primary/30"
                    }`}
                  >
                    {/* Thumbnail */}
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

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isSelected ? "text-m3-primary" : "text-white"
                        }`}
                      >
                        {track.title}
                      </h4>
                      <p className="text-xs text-m3-onSurfaceVariant truncate mt-0.5">
                        {track.artist}
                      </p>
                      {track.durationSeconds > 0 && (
                        <span className="text-[10px] text-m3-onSurfaceVariant/60 font-mono">
                          {formatTime(track.durationSeconds)}
                        </span>
                      )}
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(track.id);
                      }}
                      className="p-2 rounded-full hover:bg-white/10 transition"
                      title="Favorite"
                    >
                      <Heart
                        className={`w-4 h-4 transition ${
                          isFav ? "text-m3-favorite fill-m3-favorite" : "text-m3-onSurfaceVariant"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION (Material 3 NavigationBar)   */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 liquid-glass border-t border-white/5 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => {
            setCurrentNav("home");
            setActiveChip("All");
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition ${
            currentNav === "home" ? "text-m3-primary" : "text-m3-onSurfaceVariant"
          }`}
        >
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => setCurrentNav("search")}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition ${
            currentNav === "search" ? "text-m3-primary" : "text-m3-onSurfaceVariant"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">Search</span>
        </button>

        <button
          onClick={() => setCurrentNav("library")}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition ${
            currentNav === "library" ? "text-m3-primary" : "text-m3-onSurfaceVariant"
          }`}
        >
          <LibraryIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Library</span>
        </button>

        <button
          onClick={() => setCurrentNav("radar")}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-full transition ${
            currentNav === "radar" ? "text-m3-primary" : "text-m3-onSurfaceVariant"
          }`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-medium">Radar</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* 4. PERSISTENT FLOATING LIQUID GLASS MINI-PLAYER CAPSULE   */}
      {/* ========================================================= */}
      {currentTrack && (
        <div className="fixed bottom-14 md:bottom-3 left-2 right-2 md:left-24 md:right-4 z-40">
          <div className="liquid-glass rounded-2xl p-2.5 md:p-3.5 border border-m3-primary/20 shadow-2xl backdrop-blur-2xl flex flex-col gap-1.5">
            {/* Scrubber Bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-m3-primary"
            />

            <div className="flex items-center justify-between gap-3">
              {/* Track Info (Click expands full player) */}
              <div
                onClick={() => setIsExpandedPlayer(true)}
                className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
              >
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
                  <h4 className="text-xs md:text-sm font-bold text-white truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-[11px] text-m3-onSurfaceVariant truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 md:gap-4">
                {/* Synced Lyrics Toggle Button */}
                <button
                  onClick={() => setShowLyricsPanel((prev) => !prev)}
                  className={`p-2 rounded-xl transition ${
                    showLyricsPanel ? "bg-m3-primary text-m3-onPrimary" : "hover:bg-white/10 text-m3-onSurfaceVariant"
                  }`}
                  title="Synced Lyrics (L)"
                >
                  <ListMusic className="w-4 h-4" />
                </button>

                {/* Play / Pause Primary Container Button */}
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-m3-primary text-m3-onPrimary flex items-center justify-center hover:scale-105 transition shadow-lg shadow-m3-primary/30"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Volume Slider (Desktop) */}
                <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10">
                  <button
                    onClick={() => setIsMuted((prev) => !prev)}
                    className="text-m3-onSurfaceVariant hover:text-white"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
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
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SYNCED LYRICS DRAWER / POPUP                           */}
      {/* ========================================================= */}
      {showLyricsPanel && (
        <div className="fixed bottom-28 md:bottom-24 right-4 z-50 w-80 md:w-96 max-h-[480px] liquid-glass rounded-3xl p-5 border border-m3-primary/30 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-m3-primary flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Synchronized Lyrics
            </h4>
            <button
              onClick={() => setShowLyricsPanel(false)}
              className="text-m3-onSurfaceVariant hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 font-medium text-sm no-scrollbar">
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
                        ? "text-m3-lyricActive font-bold text-base scale-105"
                        : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-xs text-m3-onSurfaceVariant text-center py-8">
                No synced lyrics found for this track.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. FULL SCREEN EXPANDED NOW PLAYING SHEET                 */}
      {/* ========================================================= */}
      {isExpandedPlayer && currentTrack && (
        <div className="fixed inset-0 z-50 bg-m3-background/95 backdrop-blur-3xl flex flex-col justify-between p-6 md:p-12 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
            <button
              onClick={() => setIsExpandedPlayer(false)}
              className="p-2.5 rounded-full liquid-glass text-white hover:bg-white/10"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-m3-primary">
                Playing From Sound Network
              </p>
              <h3 className="text-sm font-bold text-white truncate max-w-xs">
                {currentTrack.title}
              </h3>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="p-2.5 rounded-full liquid-glass text-white hover:bg-white/10"
            >
              <Heart
                className={`w-6 h-6 ${
                  favorites.has(currentTrack.id) ? "text-m3-favorite fill-m3-favorite" : ""
                }`}
              />
            </button>
          </div>

          {/* Central Artwork */}
          <div className="max-w-md mx-auto w-full py-6 flex flex-col items-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={currentTrack.thumbnailUrl || "/logo.png"}
                alt={currentTrack.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="mt-8 text-center w-full">
              <h2 className="text-xl md:text-2xl font-black text-white truncate">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-m3-onSurfaceVariant mt-1 truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Controls & Scrubber */}
          <div className="max-w-xl mx-auto w-full space-y-4">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-m3-primary"
            />
            <div className="flex justify-between text-xs font-mono text-m3-onSurfaceVariant">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-center gap-8 pt-2">
              <button
                onClick={() => seek(Math.max(0, currentTime - 10))}
                className="p-3 text-white/70 hover:text-white"
              >
                <SkipBack className="w-7 h-7" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-m3-primary text-m3-onPrimary flex items-center justify-center hover:scale-105 transition shadow-2xl shadow-m3-primary/40"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={() => seek(Math.min(duration, currentTime + 10))}
                className="p-3 text-white/70 hover:text-white"
              >
                <SkipForward className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. ECOSYSTEM DOWNLOADS MODAL                              */}
      {/* ========================================================= */}
      {showDownloads && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="liquid-glass rounded-3xl max-w-lg w-full p-6 md:p-8 border border-m3-primary/30 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Xosonic" width={32} height={32} />
                <h3 className="text-lg font-bold text-white">Download Xosonic Apps</h3>
              </div>
              <button
                onClick={() => setShowDownloads(false)}
                className="text-m3-onSurfaceVariant hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-m3-onSurfaceVariant mb-6">
              Production-ready builds for all your devices by <b>XrLabs</b>
            </p>

            <div className="space-y-3">
              <a
                href="https://github.com/XezaYT/Xosonic/actions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl liquid-glass-card border border-white/5 hover:border-emerald-400/40 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Universal Android APK</h4>
                    <p className="text-xs text-m3-onSurfaceVariant">Signed release APK for all ARM devices</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-m3-primary" />
              </a>

              <a
                href="https://github.com/XezaYT/Xosonic-iOS-Lite/actions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl liquid-glass-card border border-white/5 hover:border-blue-400/40 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">iOS Lite IPA</h4>
                    <p className="text-xs text-m3-onSurfaceVariant">3-Song rolling FIFO cache IPA for sideloading</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-m3-primary" />
              </a>

              <a
                href="https://github.com/XezaYT/Xosonic-HyperX"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl liquid-glass-card border border-white/5 hover:border-purple-400/40 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Discord Voice Bot</h4>
                    <p className="text-xs text-m3-onSurfaceVariant">Real-time voice channel audio & /sync</p>
                  </div>
                </div>
                <Share2 className="w-4 h-4 text-m3-primary" />
              </a>
            </div>

            <button
              onClick={() => setShowDownloads(false)}
              className="mt-6 w-full py-3 rounded-2xl bg-m3-surfaceContainer hover:bg-m3-surfaceContainerHigh text-xs font-bold text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
