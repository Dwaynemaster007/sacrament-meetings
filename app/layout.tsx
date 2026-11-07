import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { WARD_NAME } from '@/lib/meeting-utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: `Sacrament Meeting Planner | ${WARD_NAME}`,
    template: `%s | ${WARD_NAME}`,
  },
  description: 'Plan, view and print sacrament meeting programs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main id="main" className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
