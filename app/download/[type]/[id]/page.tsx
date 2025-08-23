"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ArrowLeft, Clock, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DownloadPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5) // Changed from 20 to 5 seconds as requested
  const [canDownload, setCanDownload] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [quality, setQuality] = useState("")
  const [title, setTitle] = useState("")
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const url = searchParams.get("url")
    const q = searchParams.get("quality")
    const t = searchParams.get("title")

    if (url) setDownloadUrl(decodeURIComponent(url))
    if (q) setQuality(q)
    if (t) setTitle(decodeURIComponent(t))
  }, [searchParams])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanDownload(true)
    }
  }, [countdown])

  const handleVerification = () => {
    setVerified(true)
  }

  const handleDownload = () => {
    if (canDownload && verified && downloadUrl) {
      // Create a temporary anchor element for download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = title || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="https://envs.sh/uiU.jpg" alt="Filmzi Logo" width={32} height={32} className="rounded-lg" />
              <h1 className="text-xl font-bold text-green-400">Filmzi</h1>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Ad Placeholder - Top */}
      <div className="bg-gray-800/50 border border-green-500/20 p-4 text-center">
        <p className="text-gray-400 text-sm">Advertisement</p>
        <div className="bg-gray-700 h-24 rounded-lg flex items-center justify-center mt-2">
          <p className="text-gray-500">Ad Space - 728x90</p>
        </div>
      </div>

      {/* Download Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gray-900 border-green-500/20">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Download className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Download Ready</h1>
                <p className="text-gray-400">
                  {title} - {quality}
                </p>
              </div>

              {!canDownload ? (
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-xl font-bold text-green-400">{countdown}</span>
                  </div>
                  <p className="text-gray-400">Please wait {countdown} seconds before downloading...</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : !verified ? (
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-lg font-semibold text-green-400">Verification Required</span>
                  </div>
                  <p className="text-gray-400 mb-4">Click the button below to verify you're human</p>
                  <Button onClick={handleVerification} className="bg-blue-500 hover:bg-blue-600 text-white mb-4">
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Human
                  </Button>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-green-400 font-semibold mb-4">✓ Verified! Download is now available!</p>
                </div>
              )}

              <Button
                onClick={handleDownload}
                disabled={!canDownload || !verified}
                className={`w-full ${
                  canDownload && verified
                    ? "bg-green-500 hover:bg-green-600 text-black"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                {!canDownload ? `Wait ${countdown}s` : !verified ? "Verify First" : "Download Now"}
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                If download doesn't start automatically, click the button above.
              </p>
            </CardContent>
          </Card>

          {/* Ad Placeholder - Middle */}
          <div className="bg-gray-800/50 border border-green-500/20 p-4 text-center mt-6 rounded-lg">
            <p className="text-gray-400 text-sm">Advertisement</p>
            <div className="bg-gray-700 h-32 rounded-lg flex items-center justify-center mt-2">
              <p className="text-gray-500">Ad Space - 300x250</p>
            </div>
          </div>
        </div>
      </main>

      {/* Ad Placeholder - Bottom */}
      <div className="bg-gray-800/50 border border-green-500/20 p-4 text-center">
        <p className="text-gray-400 text-sm">Advertisement</p>
        <div className="bg-gray-700 h-24 rounded-lg flex items-center justify-center mt-2">
          <p className="text-gray-500">Ad Space - 728x90</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-green-500/20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm mb-2">© 2025 Filmzi. All rights reserved.</p>
          <p className="text-gray-500 text-xs max-w-2xl mx-auto">
            Our website does not host any movie links or movies on our servers. Everything is from third party sources.
            We are not responsible for any content.
          </p>
        </div>
      </footer>
    </div>
  )
}
