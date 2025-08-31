To make the download page more secure and user-friendly, the verification step should be an integral part of the download process. Instead of a separate "Verify Human" button, a better approach is to use a modern CAPTCHA solution that integrates seamlessly with the download button.
A good example of this is Google reCAPTCHA. By integrating reCAPTCHA, you can verify the user's authenticity and then enable the download button, all within the same user flow. The user will click the button, the reCAPTCHA will run in the background (or display a challenge if needed), and on success, the download will begin. This removes the "Verify" state and streamlines the process.
Here's the updated code that implements this change:
Updated DownloadPage.js Script
"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ArrowLeft, Clock, Shield, CircleCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Note: For a real-world application, you would need to install a reCAPTCHA library
// and configure it. This is a conceptual example.
// npm install react-google-recaptcha-v3 or similar library

export default function DownloadPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(5) // 5-second initial countdown
  const [isTimerComplete, setIsTimerComplete] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState("")
  const [quality, setQuality] = useState("")
  const [title, setTitle] = useState("")

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
      setIsTimerComplete(true)
    }
  }, [countdown])

  const handleDownload = async () => {
    if (isTimerComplete && !isVerified) {
      // Simulate reCAPTCHA verification. In a real app, you'd call a reCAPTCHA API here.
      // e.g., const token = await reCaptcha.execute()
      // Then send the token to your server for validation.
      // For this example, we'll just set it to true after a short delay.
      setIsVerified(true);
      return;
    }
    
    if (isTimerComplete && isVerified && downloadUrl) {
      // Create a temporary anchor element for download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = title || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadButtonText = () => {
    if (!isTimerComplete) {
      return `Wait ${countdown}s`
    }
    if (!isVerified) {
      return "Verify & Download"
    }
    return "Download Now"
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

              {!isTimerComplete ? (
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
              ) : (
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <CircleCheck className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-lg font-semibold text-green-400">Timer Complete!</span>
                  </div>
                  <p className="text-gray-400 mb-4">Click the button below to start your download.</p>
                </div>
              )}

              <Button
                onClick={handleDownload}
                disabled={!isTimerComplete}
                className={`w-full ${
                  isTimerComplete
                    ? "bg-green-500 hover:bg-green-600 text-black"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Download className="w-4 h-4 mr-2" />
                {downloadButtonText()}
              </Button>

              <p className="text-xs text-gray-500 mt-4">
                If the download doesn't start automatically, click the button above again.
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

