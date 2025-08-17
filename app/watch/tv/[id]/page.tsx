"use client"

import PlyrPlayer from "@/components/plyr-player"
import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface TVSeries {
  id: number
  title: string
  poster_url: string
  release_date: string
  language: string
}

export default function WatchTVSeriesPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [tvSeries, setTVSeries] = useState<TVSeries | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [currentSeason, setCurrentSeason] = useState<number>(1)
  const [currentEpisode, setCurrentEpisode] = useState<number>(1)

  useEffect(() => {
    const url = searchParams.get("url")
    const season = searchParams.get("season")
    const episode = searchParams.get("episode")

    if (url) {
      setVideoUrl(decodeURIComponent(url))
    }
    if (season) {
      setCurrentSeason(Number.parseInt(season))
    }
    if (episode) {
      setCurrentEpisode(Number.parseInt(episode))
    }

    if (params.id) {
      fetchTVSeriesDetails(params.id as string)
    }
  }, [params.id, searchParams])

  const fetchTVSeriesDetails = async (id: string) => {
    try {
      const response = await fetch(`https://movie-database-real-working-mx21.vercel.app/media/${id}`)
      const data = await response.json()

      if (data.status === "success") {
        setTVSeries(data.data)
      }
    } catch (error) {
      console.error("Error fetching TV series details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">No Video URL</h1>
          <p className="text-gray-400 mb-6">Video URL is required to play the episode.</p>
          <Link href="/">
            <Button className="bg-green-500 hover:bg-green-600 text-black">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
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
            <div className="flex items-center space-x-4">
              <Link href={`/tv/${params.id}`}>
                <Button
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Series
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Episode Title */}
          {tvSeries && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {tvSeries.title} - S{currentSeason}E{currentEpisode}
              </h1>
              <p className="text-gray-400">
                Season {currentSeason}, Episode {currentEpisode} • {new Date(tvSeries.release_date).getFullYear()} •{" "}
                {tvSeries.language}
              </p>
            </div>
          )}

          <PlyrPlayer
            sources={[
              { src: videoUrl, type: "video/mp4", size: 1080 },
              { src: videoUrl.replace("1080p", "720p"), type: "video/mp4", size: 720 },
            ]}
            poster={tvSeries?.poster_url}
          />

          {/* Episode Navigation */}
          <div className="mt-6 flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                disabled={currentEpisode <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous Episode
              </Button>
              <Button
                variant="outline"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
              >
                <ChevronRight className="w-4 h-4 ml-1" />
                Next Episode
              </Button>
            </div>

            <Link
              href={`/download/tv/${params.id}?url=${encodeURIComponent(videoUrl)}&quality=1080p&title=${encodeURIComponent(`${tvSeries?.title} S${currentSeason}E${currentEpisode}` || "Episode")}`}
            >
              <Button
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Episode
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-green-500/20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm mb-2">© 2025 Filmzi. All rights reserved.</p>
          <p className="text-gray-500 text-xs max-w-2xl mx-auto">
            Our website does not host any movie links or movies on servers. Everything is from third party sources. We
            are not responsible for any content.
          </p>
        </div>
      </footer>
    </div>
  )
}
