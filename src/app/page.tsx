import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

type Entry = { id: string; song: string; brand: string; ts: number };

async function readEntries(): Promise<Entry[]> {
  const jar = await cookies();
  const raw = jar.get('cp_entries')?.value ?? '[]';
  try { return JSON.parse(raw) as Entry[]; } catch { return []; }
}

async function writeEntries(list: Entry[]) {
  const jar = await cookies();
  jar.set('cp_entries', JSON.stringify(list.slice(0, 200)), {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

export default async function Page() {
  const entries = await readEntries();
  const suggestions = Array.from(new Set(entries.map(e => e.brand).filter(Boolean))).slice(0, 50);

  // SERVER ACTION: add a song (stays on the same page)
  async function addAction(formData: FormData) {
    'use server';
    const song = String(formData.get('song') || '').trim();
    const brand = String(formData.get('brand') || '').trim();
    if (!song) return;

    const list = await readEntries();
    list.unshift({ id: crypto.randomUUID(), song, brand, ts: Date.now() });
    await writeEntries(list);
    revalidatePath('/'); // refresh this page
  }

  // SERVER ACTION: remove by id
  async function removeAction(formData: FormData) {
    'use server';
    const id = String(formData.get('id') || '');
    if (!id) return;

    const list = await readEntries();
    const next = list.filter(e => e.id !== id);
    await writeEntries(next);
    revalidatePath('/');
  }

  return (
    <main className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Chord Picker</h1>
        <p className="opacity-80 mt-1">Add your favorite songs. Manage them below.</p>
      </header>

      {/* Add form */}
      <form action={addAction} className="glass space-y-4">
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
          <p className="text-xs opacity-70 mt-1">Suggestions come from your previous inputs (cookies).</p>
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
                <form action={removeAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="btn" aria-label={`Remove ${e.song}`}>Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
