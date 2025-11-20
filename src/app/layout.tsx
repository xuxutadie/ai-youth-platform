import './globals.css'
import { Inter } from 'next/font/google'
import ResizableLayout from '@/components/ResizableLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '青少年AIGC成果展示平台',
  description: '展示青少年AIGC成果的网站',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
      </head>
      <body className={inter.className}>
        <ResizableLayout>
          {children}
        </ResizableLayout>
      </body>
    </html>
  )
}