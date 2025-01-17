import '@/styles/globals.css';
import { Metadata } from 'next';
import { Link } from '@nextui-org/link';
import clsx from 'clsx';

import { Providers } from './providers';

import { siteConfig } from '@/config/site';
import { fontSans } from '@/config/fonts';
import { Navbar } from '@/components/navbar';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: {
    default: 'CGPS Houses',
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/cgps-houses-mini-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          'min-h-screen w-full font-sans antialiased',
          fontSans.variable,
        )}
      >
        <AuthProvider>
          <Providers themeProps={{ attribute: 'class' }}>
            <div className="relative w-full flex flex-col h-screen">
              <Navbar />
              <main className="bg-background text-foreground container pt-16 px-6 flex-grow max-w-full">
                {children}
              </main>
              <footer className="w-full flex items-center justify-center py-3">
                <Link
                  isExternal
                  className="flex items-center gap-1 text-current"
                  href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
                  title="nextui.org homepage"
                >
                  <span className="text-default-600">Powered by</span>
                  <p className="text-primary">NextUI</p>
                </Link>
              </footer>
            </div>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
