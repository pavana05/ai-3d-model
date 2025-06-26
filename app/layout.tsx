import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata = {
  title: "3D AI Model Generator - Professional 3D Creation",
  description:
    "Transform your ideas into stunning 3D models with advanced AI technology. Professional quality, multiple formats, real-time preview.",
  keywords: "3D model, AI, generator, GLB, USDZ, FBX, OBJ, STL, 3D printing, game development",
  authors: [{ name: "Pavan.A" }],
  creator: "Pavan.A",
  publisher: "Pavan.A",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
  robots: "index, follow",
  openGraph: {
    title: "3D AI Model Generator",
    description: "Transform your ideas into stunning 3D models with advanced AI technology",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "3D AI Model Generator",
    description: "Transform your ideas into stunning 3D models with advanced AI technology",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-slate-900 text-white antialiased`}>{children}</body>
    </html>
  )
}
