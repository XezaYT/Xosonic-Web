"use client";

import React, { useState, useEffect, useRef } from "react";
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
  RefreshCw,
  Github,
  Bot,
  Smartphone,
  Apple
} from "lucide-react";
import type { Track, LyricLine } from "@/types";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [showDownloads, setShowDownloads] = useState(false);
  const [activeListeners, setActiveListeners] = useState(42);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pulse effect for radar
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveListeners((prev) => Math.max(12, prev + Math.floor(Math.random() * 5) - 2));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, isPlaying]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.tracks || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

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
      } catch (e) {
        console.error("Stream resolution error:", e);
      }
    }

    if (playUrl && audioRef.current) {
      audioRef.current.src = playUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }

    // Fetch lyrics
    fetchLyrics(track.title, track.artist);
  };

  const fetchLyrics = async (title: string, artist: string) => {
    setLyrics([]);
    try {
      const res = await fetch(`/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
      const data = await res.json();
      if (data.lyrics && typeof data.lyrics === "string") {
        const parsed: LyricLine[] = [];
        const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
        for (const line of data.lyrics.split("\n")) {
          const match = line.match(regex);
          if (match) {
            const min = parseInt(match[1], 10);
            const sec = parseInt(match[2], 10);
            const ms = parseInt(match[3].padEnd(3, "0").slice(0, 3), 10);
            const text = match[4].trim();
            if (text) parsed.push({ timeMs: min * 60000 + sec * 1000 + ms, text });
          }
        }
        setLyrics(parsed);
      }
    } catch {}
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleLocalFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const localTrack: Track = {
      id: `local_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Audio File",
      durationSeconds: 0,
      streamUrl: url,
      isLocal: true,
    };

    setResults((prev) => [localTrack, ...prev]);
    playTrack(localTrack);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#08080c] text-white">
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Image src="/logo.png" alt="Xosonic Logo" fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                XOSONIC
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                WEB
              </span>
            </div>
            <p className="text-[11px] text-white/40">Studio: XrLabs • beatrix.sql</p>
          </div>
        </div>

        {/* Radar Telemetry Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
          <span className="text-white/60">RADAR PULSE:</span>
          <span className="text-cyan-300 font-semibold">{activeListeners} ACTIVE</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDownloads(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get Apps</span>
          </button>
          <a
            href="https://github.com/XezaYT/Xosonic"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mb-28">
        {/* Left Column: Search & Results */}
        <section className="lg:col-span-2 flex flex-col gap-5">
          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, mixes, or paste an audio link..."
              className="w-full pl-12 pr-28 py-3.5 rounded-xl glass-panel text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 transition"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs tracking-wide transition"
            >
              Search
            </button>
          </form>

          {/* Local Audio Picker Card */}
          <div className="glass-card rounded-xl p-4 flex items-center justify-between border-dashed border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <FileAudio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Play Local Audio File</h4>
                <p className="text-xs text-white/40">Play .mp3, .wav, .flac, .m4a directly in your browser</p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLocalFile}
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Browse
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">
              {results.length > 0 ? "Search Results" : "Featured Streams"}
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/40">
                <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                <p className="text-xs">Resolving high-speed streams...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="glass-card rounded-xl p-10 text-center flex flex-col items-center gap-3 text-white/40">
                <Sparkles className="w-8 h-8 text-cyan-400/50" />
                <p className="text-sm font-medium text-white/60">Discover Music with Xosonic</p>
                <p className="text-xs max-w-sm">
                  Search for any song title or drop your local audio files to enjoy zero-buffer web playback.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {results.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`glass-card rounded-xl p-3 flex items-center justify-between cursor-pointer group ${
                      currentTrack?.id === track.id ? "border-cyan-400/50 bg-cyan-500/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="relative w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                        {track.thumbnailUrl ? (
                          <Image src={track.thumbnailUrl} alt={track.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/30">
                            <FileAudio className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <p
                          className={`text-sm font-semibold truncate ${
                            currentTrack?.id === track.id ? "text-cyan-300" : "text-white"
                          }`}
                        >
                          {track.title}
                        </p>
                        <p className="text-xs text-white/50 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-white/40 ml-4">
                      {track.durationSeconds > 0 ? formatTime(track.durationSeconds) : "Local"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Live Lyrics & Telemetry */}
        <section className="flex flex-col gap-5">
          <div className="glass-panel rounded-xl p-5 flex flex-col h-[480px]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3 flex items-center justify-between">
              <span>Synchronized Lyrics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-300">
                LIVE LRC
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 flex flex-col justify-center items-center text-center">
              {lyrics.length > 0 ? (
                lyrics.map((line, idx) => {
                  const isActive =
                    currentTime * 1000 >= line.timeMs &&
                    (idx === lyrics.length - 1 || currentTime * 1000 < lyrics[idx + 1].timeMs);
                  return (
                    <p
                      key={idx}
                      className={`text-sm transition-all duration-300 ${
                        isActive
                          ? "text-cyan-300 font-bold scale-105 text-base"
                          : "text-white/30 hover:text-white/60"
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : (
                <div className="text-white/30 text-xs">
                  {currentTrack ? "No synchronized lyrics available" : "Play a song to view live lyrics"}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Bottom Music Player Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Current Song Details */}
          <div className="flex items-center gap-3 w-full md:w-1/4">
            <div className="relative w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10">
              {currentTrack?.thumbnailUrl ? (
                <Image src={currentTrack.thumbnailUrl} alt={currentTrack.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <FileAudio className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {currentTrack ? currentTrack.title : "Ready to play"}
              </p>
              <p className="text-xs text-white/40 truncate">
                {currentTrack ? currentTrack.artist : "Select a track or local file"}
              </p>
            </div>
          </div>

          {/* Player Controls & Scrubber */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4">
            <div className="flex items-center gap-5">
              <button className="text-white/50 hover:text-white transition">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlayPause}
                disabled={!currentTrack}
                className="w-10 h-10 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] transition disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
              </button>
              <button className="text-white/50 hover:text-white transition">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Scrubber Bar */}
            <div className="flex items-center gap-3 w-full max-w-md text-[11px] font-mono text-white/40">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center justify-end gap-2.5 w-1/4">
            <button onClick={() => setIsMuted(!isMuted)} className="text-white/50 hover:text-white transition">
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
              className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </footer>

      {/* Downloads Modal */}
      {showDownloads && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-white/20 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Download Xosonic Apps</h3>
            <p className="text-xs text-white/50 mb-5">Native high-performance builds for every platform</p>

            <div className="space-y-3">
              <a
                href="https://github.com/XezaYT/Xosonic/actions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl glass-card border border-white/10 hover:border-cyan-400/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Universal Android APK</h4>
                    <p className="text-xs text-white/40">Signed release APK for all ARM ABIs</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-cyan-400" />
              </a>

              <a
                href="https://github.com/XezaYT/Xosonic-iOS-Lite/actions"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl glass-card border border-white/10 hover:border-cyan-400/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">iOS Lite IPA</h4>
                    <p className="text-xs text-white/40">3-Song FIFO cache IPA for sideloading</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-cyan-400" />
              </a>

              <a
                href="https://github.com/XezaYT/Xosonic-HyperX"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl glass-card border border-white/10 hover:border-cyan-400/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">Discord Voice Bot</h4>
                    <p className="text-xs text-white/40">Direct voice channel streaming & /sync</p>
                  </div>
                </div>
                <Share2 className="w-4 h-4 text-cyan-400" />
              </a>
            </div>

            <button
              onClick={() => setShowDownloads(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
