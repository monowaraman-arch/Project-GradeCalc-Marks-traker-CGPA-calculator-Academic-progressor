import type { Metadata, Viewport } from 'next'
import { Allison, Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/components/app-provider'
import { Header } from '@/components/header'
import { PageTransition } from '@/components/page-transition'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const allison = Allison({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-allison",
});

export const metadata: Metadata = {
  title: 'GradeCalc - Student Grade Calculator',
  description: 'Calculate your course grades, Current Semester CGPA, and All-Time CGPA with customizable mark distributions',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${allison.variable} font-sans antialiased min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppProvider>
            <Header />
            <main className="pb-8">
              <PageTransition>{children}</PageTransition>
            </main>
          </AppProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

