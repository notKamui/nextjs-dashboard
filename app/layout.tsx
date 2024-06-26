import NextTopLoader from 'nextjs-toploader'
import { inter } from "@/app/ui/fonts";
import "@/app/ui/global.css";
import { ReactNode } from 'react'

export const metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Course Dashboard, built with App Router',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
    <body className={`${inter.className} antialiased`}>
      <NextTopLoader />
      {children}
    </body>
    </html>
  );
}
