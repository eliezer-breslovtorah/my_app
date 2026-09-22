"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getDownloadURL, getMetadata, listAll, ref } from "firebase/storage";
import { storage } from "../firebase";
import { formatDuration, makeRecordings, matchesRecording, type Recording } from "./lib/audio-library";
import styles from "./page.module.css";

export default function Home() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [book, setBook] = useState("");
  const [type, setType] = useState("");
  const [teacher, setTeacher] = useState("");
  const [active, setActive] = useState<Recording | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [playError, setPlayError] = useState("");
  const [speed, setSpeed] = useState("1");
  const audio = useRef<HTMLAudioElement>(null);
  const request = useRef(0);
  const urls = useRef(new Map<string, string>());
  const currentPath = useRef<string | null>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const listing = await listAll(ref(storage));
        const items = makeRecordings(listing.items);
        if (cancelled) return;
        setRecordings(items);
        setLoading(false);
        // Optional metadata enriches the list without delaying search or playback.
        let next = 0;
        await Promise.all(Array.from({ length: 4 }, async () => {
          while (!cancelled && next < items.length) {
            const item = items[next++];
            try {
              const metadata = (await getMetadata(ref(storage, item.path))).customMetadata;
              const speaker = metadata?.teacher?.trim() || metadata?.speaker?.trim();
              const seconds = Number(metadata?.durationSeconds);
              if (!cancelled && (speaker || seconds > 0)) {
                setRecordings((current) => current.map((recording) => recording.path === item.path
                  ? { ...recording, teacher: speaker, duration: Number.isFinite(seconds) && seconds > 0 ? seconds : recording.duration }
                  : recording));
              }
            } catch { /* A missing optional field must not hide a playable recording. */ }
          }
        }));
      } catch {
        if (!cancelled) {
          setLoadError("We couldn’t load the recordings. Please try again.");
          setLoading(false);
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => () => { request.current++; }, []);

  const books = Array.from(new Set(recordings.map((item) => item.book)));
  const teachers = Array.from(new Set(recordings.flatMap((item) => item.teacher ? [item.teacher] : []))).sort();
  const visible = recordings.filter((item) => matchesRecording(item, query, book, type, teacher));
  const hasFilters = Boolean(query || book || type || teacher);

  function clearFilters() {
    setQuery(""); setBook(""); setType(""); setTeacher(""); search.current?.focus();
  }

  async function play(item: Recording) {
    const player = audio.current;
    if (!player) return;
    const id = ++request.current;
    setPlayError("");
    if (currentPath.current === item.path && player.getAttribute("src")) {
      setPending(null);
      if (!player.paused) { player.pause(); return; }
      try { await player.play(); }
      catch { if (request.current === id) setPlayError("Playback could not start. Try the audio controls below."); }
      return;
    }
    player.pause();
    player.removeAttribute("src");
    player.load();
    currentPath.current = null;
    setActive(item);
    setPending(item.path);
    try {
      let url = urls.current.get(item.path);
      if (!url) {
        url = await getDownloadURL(ref(storage, item.path));
        urls.current.set(item.path, url);
      }
      if (request.current !== id) return;
      currentPath.current = item.path;
      player.src = url;
      player.playbackRate = Number(speed);
      await player.play();
    } catch {
      if (request.current === id) setPlayError("Couldn’t play this recording. Try Play again or use the audio controls.");
    } finally {
      if (request.current === id) setPending(null);
    }
  }

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#recordings">Skip to recordings</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.identity}>
            <span className={styles.mark} aria-hidden="true">BT</span>
            <span><span className={styles.brand}>Breslov Torah</span><span className={styles.tagline}>Official Site of Rabbi Nasan Maimon</span></span>
          </Link>
          <details className={styles.menu}>
            <summary>Menu</summary>
            <nav aria-label="More navigation">
              <Link href="/category/nach">Browse Nach</Link>
              <a href="https://www.breslovtorah.com/about-us/">About us</a>
              <a href="https://www.breslovtorah.com/">Visit our original website</a>
            </nav>
          </details>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.intro}><h1>Find your next shiur</h1><p>Search. Choose. Listen.</p></div>
        <section className={styles.filters} aria-label="Find recordings">
          <label className={styles.search}>Search lessons
            <input ref={search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, topic, teacher, or book…" />
          </label>
          <label>Teacher<select value={teacher} onChange={(event) => setTeacher(event.target.value)} disabled={loading || teachers.length === 0}>
            <option value="">All teachers</option>{teachers.map((name) => <option key={name}>{name}</option>)}
          </select></label>
          <label>Book / Series<select value={book} onChange={(event) => setBook(event.target.value)} disabled={loading}>
            <option value="">All books</option>{books.map((name) => <option key={name}>{name}</option>)}
          </select></label>
          <label>Type<select value={type} onChange={(event) => setType(event.target.value)} disabled={loading}>
            <option value="">All types</option><option value="full">Full lessons</option><option value="clips">Clips</option>
          </select></label>
        </section>
        <div className={styles.summary}>
          <p role="status">{loading ? "Loading recordings…" : loadError ? "Recordings unavailable" : `${visible.length} of ${recordings.length} recordings`}</p>
          {hasFilters && <button onClick={clearFilters}>Clear filters</button>}
        </div>
        {loadError && <div className={styles.empty} role="alert"><p>{loadError}</p><button onClick={() => { setLoadError(""); setLoading(true); setAttempt((value) => value + 1); }}>Try again</button></div>}
        <section id="recordings" aria-label="Recordings" aria-busy={loading}>
          <div className={styles.columnHead} aria-hidden="true"><span /><span>Recording</span><span>Type</span><span>Length</span></div>
          {visible.map((item) => {
            const isActive = active?.path === item.path;
            return <article key={item.path} className={`${styles.row} ${isActive ? styles.selected : ""}`}>
              <button className={styles.play} onClick={() => void play(item)} disabled={pending === item.path} aria-label={`${isActive && playing ? "Pause" : "Play"} ${item.title}`}>
                <span aria-hidden="true">{isActive && playing ? "Ⅱ" : "▶"}</span>{pending === item.path ? "Loading…" : isActive && playing ? "Pause" : "Play"}
              </button>
              <div className={styles.details}><h2>{item.title}</h2><p>{[item.teacher, item.book, item.lesson].filter(Boolean).join(" · ")}</p></div>
              <span className={styles.type}>{item.isClip ? "Clip" : "Full lesson"}</span>
              <span className={styles.duration} aria-label={item.duration ? `Duration ${formatDuration(item.duration)}` : "Duration available when loaded"}>{formatDuration(item.duration)}</span>
            </article>;
          })}
          {!loading && !loadError && visible.length === 0 && <div className={styles.empty}>
            <h2>{recordings.length ? "No matching recordings" : "No recordings yet"}</h2>
            {hasFilters && <><p>Try a shorter search or clear your filters.</p><button onClick={clearFilters}>Show all recordings</button></>}
          </div>}
        </section>
      </main>
      <footer className={styles.player} aria-label="Audio player">
        <div className={styles.playerInner}>
          <div className={styles.nowPlaying} aria-live="polite"><small>{pending ? "Loading recording" : playing ? "Now playing" : active ? "Paused" : "Ready to listen"}</small><strong>{active?.title ?? "Choose Play beside any recording"}</strong>{active && <span>{active.book}</span>}</div>
          <audio ref={audio} controls preload="none" aria-label={active ? `Audio: ${active.title}` : "Audio player"}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
            onError={() => { if (currentPath.current) { urls.current.delete(currentPath.current); currentPath.current = null; setPlaying(false); setPlayError("This recording could not be loaded. Please try Play again."); } }}
            onLoadedMetadata={(event) => {
              const duration = event.currentTarget.duration;
              const path = currentPath.current;
              if (path && Number.isFinite(duration)) setRecordings((items) => items.map((item) => item.path === path ? { ...item, duration } : item));
            }} />
          <label className={styles.speed}>Speed<select value={speed} onChange={(event) => { setSpeed(event.target.value); if (audio.current) audio.current.playbackRate = Number(event.target.value); }}>
            <option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option>
          </select></label>
          {playError && <p className={styles.playerError} role="alert">{playError}</p>}
        </div>
      </footer>
    </div>
  );
}
