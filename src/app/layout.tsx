import './globals.css'
import AuthGuard from '@/components/AuthGuard'
import AppHeader from '@/components/AppHeader'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5efe3] text-[#2d2418]">

        <AppHeader />

        {/* Main Content */}
<main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 lg:px-6">
  <AuthGuard>
    {children}
  </AuthGuard>
</main>

      </body>
    </html>
  )
}
