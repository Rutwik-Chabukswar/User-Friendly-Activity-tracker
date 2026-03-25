import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Activity Tracker – Track Your Progress',
  description:
    'Track your long-term goals with daily progress logging. Stay motivated with clear progress visualization.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
