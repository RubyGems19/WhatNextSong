'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Entry = { id: string; song: string; brand: string; ts: number };

// ----- client storage helpers -----
const KEY = 'cp_entries_v1';

function safeRead(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(list: Entry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* ignore quota errors */
  }
}

export default function Page() {
  const [entries, setEntries] = useState<Entry[]>([]);

  // load on mount
  useEffect(() => {
    setEntries(safeRead());
  }, []);

  const suggestions = useMemo(
    () => Array.from(new Set(entries.map(e => e.brand).filter(Boolean))).slice(0, 50),
    [entries]
  );

  // add a song (no redirect)
  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const song = String(fd.get('song') || '').trim();
    const brand = String(fd.get('brand') || '').trim();
    if (!song) return;

    const next: Entry[] = [{ id: crypto.randomUUID(), song, brand, ts: Date.now() }, ...safeRead()];
    safeWrite(next);
    setEntries(next);
    e.currentTarget.reset();
  }

  // remove by id
  function remove(id: string) {
    const next = safeRead().filter(e => e.id !== id);
    safeWrite(next);
    setEntries(next);
  }

  return (
    <main className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Chord Picker</h1>
        <p className="opacity-80 mt-1">Add your favorite songs. Manage them below.</p>
      </header>

      {/* Add form */}
      <form onSubmit={add} className="glass space-y-4">
        <div>
          <div className="label">Song name</div>
          <input name="song" placeholder='e.g., "Sugar"' className="input" required />
        </div>

        <div>
          <div className="label">Band / Brand</div>
          <input name="brand" list="brand-options" placeholder='e.g., "Maroon 5"' className="input" />
          <datalist id="brand-options">
            {suggestions.map((b) => <option key={b} value={b} />)}
          </datalist>
          <p className="text-xs opacity-70 mt-1">Suggestions come from your previous inputs.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-primary">Add song</button>
          <Link href="/random" className="btn">Randomizer page</Link>
        </div>
      </form>

      {/* List + remove */}
      <section className="glass">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Your songs</h2>
          <span className="text-sm opacity-70">{entries.length} saved</span>
        </div>

        {entries.length === 0 ? (
          <p className="opacity-80 text-sm">No songs yet — add one above.</p>
        ) : (
          <ul className="text-sm space-y-2 max-h-80 overflow-auto pr-1">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 border-b border-[var(--border)]/40 pb-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">{e.song}</div>
                  <div className="opacity-70 truncate">{e.brand}</div>
                </div>
                <button className="btn" onClick={() => remove(e.id)} aria-label={`Remove ${e.song}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
