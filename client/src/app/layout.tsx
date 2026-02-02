
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Rubik_Mono_One } from 'next/font/google';

const rubikMono = Rubik_Mono_One({ subsets: ['latin'], weight: '400', variable: '--font-rubik' });

export const metadata: Metadata = {
  title: "Beni Hassen Tkawer",
  description: "Organisé par JCI Beni Hassen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubikMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
