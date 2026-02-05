
import type { Metadata } from "next";
import "./globals.css";
import { Oswald, Inter } from 'next/font/google';


const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

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
        className={`${oswald.variable} ${inter.variable} font-sans antialiased text-sm`}
        suppressHydrationWarning
      >
        {children}

      </body>
    </html>
  );
}
