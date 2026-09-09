import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Valzz Alight Motion Pro Free | by valzzdev',
  description: 'Portal Aktivasi Alight Motion Premium Free by valzzdev dengan sistem Magic Link, verifikasi iklan bertahap, dan proteksi anti-bot.',
  openGraph: {
    title: 'Valzz Alight Motion Pro Free | by valzzdev',
    description: 'Portal Aktivasi Alight Motion Premium Free by valzzdev dengan sistem Magic Link, verifikasi iklan bertahap, dan proteksi anti-bot.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Valzz Alight Motion Pro Free | by valzzdev',
    description: 'Portal Aktivasi Alight Motion Premium Free by valzzdev dengan sistem Magic Link, verifikasi iklan bertahap, dan proteksi anti-bot.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
