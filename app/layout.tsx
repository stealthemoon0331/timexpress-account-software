import type { Metadata } from 'next'
import './globals.css'
import { SessionProviderWrapper } from './session-provider'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
      <SessionProviderWrapper>
        {children}
        <ToastContainer position="top-right" autoClose={3000} />
      </SessionProviderWrapper>
      </body>
    </html>
  )
}
