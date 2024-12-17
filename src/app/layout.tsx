import Navbar from '@/components/navbar'
import TriangleOverlap from '@/components/geom/TriangleOverlap'
import { Inter } from "next/font/google";
import './globals.css'
import { cn } from '@/lib/utils';
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        inter.className,
        "antialiased min-h-screen bg-no-repeat bg-fixed bg-center bg-cover bg-light-nier dark:bg-dark-nier before:min-h-screen before:fixed before:inset-0")}
      >
        <NuqsAdapter>
          <TriangleOverlap />
          <Navbar />
          {children}
        </NuqsAdapter>
      </body>
    </html>
  )
}
