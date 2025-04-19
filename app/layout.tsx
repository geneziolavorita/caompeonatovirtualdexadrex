import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'XADREX - Jogo de Xadrez',
  description: 'Aplicativo de xadrez com interface amigável',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={inter.className}>
        <Toaster position="top-right" />
        <main className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-amber-100">
          {children}
          
          {/* Rodapé com link para limpar cache */}
          <footer className="mt-auto py-3 px-4 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} XADREX - Campeonato Virtual de Xadrez</p>
            <div className="mt-1">
              <Link href="/reset-cache" className="text-blue-500 hover:underline">
                Problemas com o site? Clique aqui para limpar o cache
              </Link>
            </div>
          </footer>
        </main>
      </body>
    </html>
  )
} 