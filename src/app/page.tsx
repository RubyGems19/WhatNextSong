"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";
import Fuse from "fuse.js";
import {
  dbAll,
  dbAdd,
  dbRemove,
  dbBulkAdd,
  migrateFromLocalStorage,
  type Entry,
} from "@/lib/db";

type SortKey = "latest" | "song" | "brand";

export default function Page() {
  const [all, setAll] = useState<Entry[]>([]);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const [busy, setBusy] = useState(false);
  const fuseRef = useRef<Fuse<Entry> | null>(null);

  // initial load + optional migration from localStorage
  useEffect(() => {
    (async () => {
      setBusy(true);
      const existing = await dbAll();
      if (existing.length === 0) {
        const migrated = migrateFromLocalStorage();
        if (migrated.length) {
          await dbBulkAdd(migrated);
        }
      }
      const fresh = await dbAll();
      setAll(fresh.sort((a, b) => b.ts - a.ts));
      fuseRef.current = new Fuse(fresh, {
        keys: ["song", "brand"],
        threshold: 0.3,
        ignoreLocation: true,
      });
      setBusy(false);
    })();
  }, []);

  // add
function add(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  // Clone reference now before async calls or state updates
  const form = e.currentTarget;
  const fd = new FormData(form);

  const song = String(fd.get('song') || '').trim();
  const brand = String(fd.get('brand') || '').trim();
  if (!song) return;

  const newEntry: Entry = { id: crypto.randomUUID(), song, brand, ts: Date.now() };

  (async () => {
    const next = [newEntry, ...await dbAll()];
    await dbAdd(newEntry);
    setAll(next);
    fuseRef.current?.add(newEntry);
    form.reset(); // ✅ now this always refers to a real form element
  })();
}


  // remove
  async function remove(id: string) {
    await dbRemove(id);
    const idx = all.findIndex((x) => x.id === id);
    if (idx >= 0) {
      const [removed] = all.splice(idx, 1);
      setAll([...all]);
      fuseRef.current?.remove((doc) => (doc as Entry).id === removed.id);
    }
  }

  // suggestions
  const suggestions = useMemo(
    () =>
      Array.from(new Set(all.map((e) => e.brand).filter(Boolean))).slice(
        0,
        100
      ),
    [all]
  );

  // filtered list (fuse for q, else sorted)
  const filtered = useMemo(() => {
    let list = all;
    if (q.trim().length) {
      list = fuseRef.current
        ? fuseRef.current.search(q.trim()).map((r) => r.item)
        : list;
    }
    switch (sortBy) {
      case "song":
        return [...list].sort((a, b) => a.song.localeCompare(b.song));
      case "brand":
        return [...list].sort((a, b) => a.brand.localeCompare(b.brand));
      default:
        return [...list].sort((a, b) => b.ts - a.ts);
    }
  }, [all, q, sortBy]);

  // batch open chord searches for filtered list
  function openChordsForFiltered(limit = 10) {
    const n = Math.min(filtered.length, limit);
    if (n === 0) return;
    const proceed =
      filtered.length > limit
        ? confirm(
            `Open Google chord for the first ${limit} of ${filtered.length} matches?`
          )
        : true;
    if (!proceed) return;
    for (let i = 0; i < n; i++) {
      const e = filtered[i];
      const query = encodeURIComponent(`${e.song} chord`);
      window.open(
        `https://www.google.com/search?q=${query}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }

  return (
    <main className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Chord Picker</h1>
        <p className="opacity-80 mt-1">
          Built to handle thousands of songs smoothly.
        </p>
      </header>

      {/* Toolbar (responsive grid) */}
      <div className="glass sticky-toolbar">
        <div className="grid grid-cols-12 gap-3">
          {/* Add form */}
          <form onSubmit={add} className="contents">
            <div className="col-span-12 md:col-span-5 lg:col-span-5">
              <input
                name="song"
                className="input"
                placeholder='Song name (e.g., "Sugar")'
                required
              />
            </div>
            <div className="col-span-12 md:col-span-4 lg:col-span-4">
              <input
                name="brand"
                list="brand-options"
                className="input"
                placeholder='Band (e.g., "Maroon 5")'
              />
              <datalist id="brand-options">
                {suggestions.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div className="col-span-12 md:col-span-3 lg:col-span-3 flex gap-2">
              <button className="btn btn-primary w-full md:w-auto">Add</button>
              <Link href="/random" className="btn w-full md:w-auto">
                Randomizer
              </Link>
            </div>
          </form>

          {/* Search + sort */}
          <div className="col-span-12 grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-7">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search song or band…"
                className="input"
              />
            </div>
            <div className="col-span-12 md:col-span-5 flex gap-3">
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSortBy(e.target.value as SortKey)
                }
                className="input"
              >
                <option value="latest">Sort: Latest</option>
                <option value="song">Sort: Song A–Z</option>
                <option value="brand">Sort: Band A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Count + status */}
      <div className="flex items-center justify-between text-sm opacity-80 px-1">
        <span>Total: {all.length.toLocaleString()} items</span>
        {q ? (
          <span>Filtered: {filtered.length.toLocaleString()}</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>

      {/* Count + status */}
      <div className="flex items-center justify-between text-sm opacity-80 px-1">
        <span>Total: {all.length.toLocaleString()} items</span>
        {q ? (
          <span>Filtered: {filtered.length.toLocaleString()}</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>

      {/* Virtualized list */}
      <section className="glass list-shell p-0">
        {busy && <div className="p-4 opacity-70">Loading…</div>}
        {!busy && filtered.length === 0 && (
          <div className="p-4 opacity-70 text-sm">
            No matches. Add some, or try a different search.
          </div>
        )}

        {!busy && filtered.length > 0 && (
          <div className="h-[62vh] md:h-[70vh] xl:h-[78vh]">
            <Virtuoso
              style={{ height: "100%" }} // 👈 fill the shell, so it grows on desktop
              totalCount={filtered.length}
              itemContent={(index) => {
                const e = filtered[index];
                const openChord = () => {
                  const q = encodeURIComponent(`${e.song} chord`);
                  window.open(
                    `https://www.google.com/search?q=${q}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                };
                return (
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border)]/40 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{e.song}</div>
                      <div className="opacity-70 truncate text-sm">
                        {e.brand || "—"}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        className="btn btn-sm"
                        onClick={openChord}
                        title={`Search ${e.song} chord`}
                      >
                        🎸 Chord
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => remove(e.id)}
                        title={`Remove ${e.song}`}
                      >
                        ✖
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        )}
      </section>
    </main>
  );
}
