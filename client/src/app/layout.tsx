
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Rubik_Mono_One, Open_Sans } from 'next/font/google';

const rubikMono = Rubik_Mono_One({ subsets: ['latin'], weight: '400', variable: '--font-rubik' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });

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
        className={`${rubikMono.variable} ${openSans.variable} font-sans antialiased text-sm`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
