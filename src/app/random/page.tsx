'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Entry = { song: string; brand: string };

function readEntries(): Entry[] {
  try {
    const raw = document.cookie.split('; ').find(c => c.startsWith('cp_entries='))?.split('=')[1];
    if (!raw) return [];
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return [];
  }
}

export default function RandomPage() {
  const entries = useMemo(() => readEntries(), []);
  const [pick, setPick] = useState<Entry | null>(null);

  useEffect(() => {
    if (entries.length) {
      setPick(entries[Math.floor(Math.random() * entries.length)]);
    }
  }, [entries]);

  const doRandom = () => {
    if (!entries.length) return;
    setPick(entries[Math.floor(Math.random() * entries.length)]);
  };

  const googleChord = () => {
    if (!pick) return;
    const q = encodeURIComponent(`${pick.song} chord`);
    window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener,noreferrer');
  };

  if (!entries.length) {
    return (
      <main className="space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-semibold">Randomizer</h1>
          <p className="opacity-80 mt-1">No songs yet.</p>
        </header>
        <div className="glass">
          <p className="opacity-90">Go add some on the home page.</p>
          <Link href="/" className="btn mt-3 inline-block">Add songs →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">Randomizer</h1>
        <p className="opacity-80 mt-1">Tap to shuffle. Then jump to Google chords.</p>
      </header>

      <section className="glass space-y-4">
        <div className="text-sm opacity-80">Random pick</div>
        <div className="rounded-xl border border-[var(--border)] p-4">
          <div className="text-xl font-semibold tracking-tight">{pick?.song ?? '—'}</div>
          <div className="opacity-75 mt-1">{pick?.brand}</div>
        </div>

        <div className="flex gap-3">
          <button onClick={doRandom} className="btn btn-primary">Randomize</button>
          <button onClick={googleChord} className="btn">Search “Chord” on Google</button>
        </div>

        <div className="text-xs opacity-70">
          Tip: The search opens <code>“&lt;song&gt; chord”</code> in a new tab.
        </div>
      </section>

      <section className="glass">
        <h2 className="font-medium mb-2">Your list</h2>
        <ul className="text-sm space-y-1 max-h-64 overflow-auto pr-1">
          {entries.map((e, i) => (
            <li key={i} className="flex justify-between border-b border-[var(--border)]/40 py-1">
              <span>{e.song}</span>
              <span className="opacity-70">{e.brand}</span>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn mt-3 inline-block">Add more →</Link>
      </section>
    </main>
  );
}
