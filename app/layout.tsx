import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { BackendInitializer } from '@/components/BackendInitializer';

export const metadata: Metadata = {
  title: 'HABITUATE - Build Better Habits',
  description: 'Track habits, compete with friends, and build consistency with gamification',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="glitch-bg" />
        <div className="scanlines" />
        <ClerkProvider>
          <BackendInitializer>
            {children}
          </BackendInitializer>
        </ClerkProvider>
      </body>
    </html>
  );
}