import Navbar from '@/components/navbar'
import TriangleAnimation from '@/components/geom/TriangleAnimation'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TriangleAnimation />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
