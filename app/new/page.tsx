import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import '@/app/globals.css';
import { cn } from '@/lib/utils';
// import { ThemeToggle } from '@/components/theme-toggle';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  metadataBase: process.env.VERCEL_URL
    ? new URL(`https://${process.env.VERCEL_URL}`)
    : undefined,
  title: 'Apna Waqeel - Pakistan\'s first legal assistant',
  description:
    'Pakistan\'s first legal assistant that provides fast and reliable legal advice.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

interface NewPageProps {
  children: React.ReactNode
}

export default function NewPage({ children }: NewPageProps) {
  return (
    <Providers
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster position="top-center" />
      <div
        className={cn(
          'font-sans antialiased flex flex-col min-h-screen',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
          <div className="flex flex-col min-h-screen">
            {/* <Header /> */}
            <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
          </div>      </div>
    </Providers>
  );
}
