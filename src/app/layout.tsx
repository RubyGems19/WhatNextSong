import './globals.css';
import type { Metadata, Viewport } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'WhatNextSong',
  description: 'Save songs, randomize, and search chords instantly.',
  manifest: `${basePath}/manifest.json`, // 👈 basePath-aware
};

export const viewport: Viewport = {
  themeColor: '#040f24',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon (SVG or ICO) */}
        <link rel="icon" href={`${basePath}/favicon.svg`} type="image/svg+xml" />
        <link rel="alternate icon" href={`${basePath}/favicon.ico`} />

        {/* iOS Add to Home Screen */}
        <link rel="apple-touch-icon" href={`${basePath}/icons/apple-touch-icon.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-6">{children}</div>

        {/* SW register (respect basePath) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  var bp = ${JSON.stringify(basePath)};
                  navigator.serviceWorker.register(bp + '/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
