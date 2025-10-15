import './globals.css';
import type { Metadata, Viewport } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: 'Chord Picker',
  description: 'Save songs, randomize, and search chords instantly.',
  manifest: `${basePath}/manifest.json`, // 👈 basePath-aware
};

export const viewport: Viewport = {
  themeColor: '#00e6ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/icons/icon-192.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen">
        <div className="mx-auto max-w-md px-4 py-6">{children}</div>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  const bp = ${JSON.stringify(basePath)};
                  navigator.serviceWorker.register(bp + '/sw.js').catch(()=>{});
                });
              }
            })();
          `
        }} />
      </body>
    </html>
  );
}
