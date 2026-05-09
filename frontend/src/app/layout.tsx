import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Cars Mar — AI Used Car Agent for Morocco",
  description:
    "AI-powered used car hunter for the Moroccan market. Scrapes Avito.ma, scores listings with Gemini AI, and surfaces the best deals.",
  keywords: ["used cars", "Morocco", "Avito", "voiture occasion", "Dacia Logan", "AI"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
