import './globals.css'
import localFont from 'next/font/local'
import { Providers } from '@/components/providers'

const inter = localFont({
  src: [
    {
      path: '../../public/fonts/InterVariable.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/InterVariable-Italic.woff2',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'optional',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})

export const metadata = {
  title: 'SafeNest Response Coordination Center',
  description: 'Emergency response coordination and case management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
