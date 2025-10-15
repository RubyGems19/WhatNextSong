'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface Song {
  song: string;
  band: string;
}

const isSongArray = (data: unknown): data is Song[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'song' in item &&
        typeof item.song === 'string' &&
        'band' in item &&
        typeof item.band === 'string'
    )
  );
};

const SongForm: React.FC = () => {
  const [song, setSong] = useState('');
  const [band, setBand] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [bandSuggestions, setBandSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const storedSongs = Cookies.get('songs');
    if (storedSongs) {
      try {
        const parsed = JSON.parse(storedSongs);
        if (isSongArray(parsed)) {
          setSongs(parsed);
          const uniqueBands = [...new Set(parsed.map((s) => s.band))];
          setBandSuggestions(uniqueBands);
        } else {
          console.error('Invalid song data in cookies');
        }
      } catch (error) {
        console.error('Error parsing cookie data:', error);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (song && band) {
      const newSongs = [...songs, { song, band }];
      setSongs(newSongs);
      Cookies.set('songs', JSON.stringify(newSongs), { expires: 365 });
      const uniqueBands = [...new Set(newSongs.map((s) => s.band))];
      setBandSuggestions(uniqueBands);
      setSong('');
      setBand('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1>Add Favorite Song</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <input
          type="text"
          placeholder="Song Name"
          value={song}
          onChange={(e) => setSong(e.target.value)}
          className="w-full"
        />
        <div className="relative">
          <input
            type="text"
            placeholder="Band Name"
            value={band}
            onChange={(e) => setBand(e.target.value)}
            list="band-suggestions"
            className="w-full"
          />
          <datalist id="band-suggestions">
            {bandSuggestions.map((b, i) => (
              <option key={i} value={b} />
            ))}
          </datalist>
        </div>
        <button type="submit" className="w-full">Add Song</button>
      </form>
      <Link href="/random">Go to Random Song</Link>
    </div>
  );
};

export default SongForm;