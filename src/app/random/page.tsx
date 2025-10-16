'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Entry = { id: string; song: string; brand: string; ts: number };
const KEY = 'cp_entries_v1';

function readEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

export default function RandomPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pick, setPick] = useState<Entry | null>(null);

  useEffect(() => {
    const list = readEntries();
    setEntries(list);
    if (list.length) setPick(list[Math.floor(Math.random() * list.length)]);
  }, []);

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
      </section>

      <section className="glass">
        <h2 className="font-medium mb-2">Your list</h2>
        <ul className="text-sm space-y-1 max-h-64 overflow-auto pr-1">
          {entries.map((e) => (
            <li key={e.id} className="flex justify-between border-b border-[var(--border)]/40 py-1">
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
