import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Md Mehedi Hasan Rueen | Software Engineer & Systems Architect Portfolio',
  description: 'Portfolio CMS showcasing high-scale distributed systems, microservices, Laravel 11 REST APIs, Next.js App Router applications, and PostgreSQL databases built by Md Mehedi Hasan Rueen.',
  keywords: ['Software Engineer', 'Systems Architect', 'Md Mehedi Hasan Rueen', 'Laravel 11', 'Next.js 15', 'PostgreSQL', 'Go', 'Distributed Systems', 'Microservices'],
  authors: [{ name: 'Md Mehedi Hasan Rueen' }],
  openGraph: {
    title: 'Md Mehedi Hasan Rueen - Software Engineer Portfolio',
    description: 'High-performance distributed systems, Laravel REST APIs, and Next.js platforms.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Md Mehedi Hasan Rueen Software Engineering Showcase',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`light ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  const originalError = console.error;
                  console.error = function(...args) {
                    if (args.some(function(arg) { return typeof arg === 'string' && arg.indexOf('bis_skin_checked') !== -1; })) {
                      return;
                    }
                    originalError.apply(console, args);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body 
        className={`${inter.className} bg-white text-slate-900 min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased`}
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1 bg-white" suppressHydrationWarning>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
