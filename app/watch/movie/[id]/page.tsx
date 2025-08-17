"use client"
import Player from "@/components/plyr-player"
import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Movie {
  id: number
  title: string
  poster_url: string
  release_date: string
  language: string
  video_links?: {
    "720p": string
    "1080p": string
  }
}

export default function WatchMoviePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [currentQuality, setCurrentQuality] = useState<string>("720p")

  useEffect(() => {
    const url = searchParams.get("url")
    const quality = searchParams.get("quality") || "720p"
    if (url) {
      setVideoUrl(decodeURIComponent(url))
      setCurrentQuality(quality)
    }

    if (params.id) {
      fetchMovieDetails(params.id as string)
    }
  }, [params.id, searchParams])

  const fetchMovieDetails = async (id: string) => {
    try {
      const response = await fetch(`https://movie-database-real-working-mx21.vercel.app/media/${id}`)
      const data = await response.json()

      if (data.status === "success") {
        setMovie(data.data)
        if (!videoUrl && data.data.video_links) {
          setVideoUrl(data.data.video_links["720p"] || data.data.video_links["1080p"] || "")
        }
      }
    } catch (error) {
      console.error("Error fetching movie details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">No Video URL</h1>
          <p className="text-gray-400 mb-6">Video URL is required to play the movie.</p>
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
              <Link href={`/movie/${params.id}`}>
                <Button
                  variant="outline"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Movie Title */}
          {movie && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
              <p className="text-gray-400">
                {new Date(movie.release_date).getFullYear()} • {movie.language}
              </p>
            </div>
          )}

          <Player
            sources={
              movie?.video_links
                ? [
                    ...(movie.video_links["1080p"]
                      ? [{ src: movie.video_links["1080p"], type: "video/mp4", size: 1080 }]
                      : []),
                    ...(movie.video_links["720p"]
                      ? [{ src: movie.video_links["720p"], type: "video/mp4", size: 720 }]
                      : []),
                  ]
                : [{ src: videoUrl, type: "video/mp4", size: Number.parseInt(currentQuality.replace("p", "")) }]
            }
            poster={movie?.poster_url}
          />

          {/* Download Options */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
            <h3 className="text-lg font-semibold text-green-400 mb-3">Download Options</h3>
            <div className="flex flex-wrap gap-3">
              {movie?.video_links ? (
                Object.entries(movie.video_links).map(([quality, url]) => (
                  <Link
                    key={quality}
                    href={`/download/movie/${params.id}?url=${encodeURIComponent(url)}&quality=${quality}&title=${encodeURIComponent(movie.title)}`}
                  >
                    <Button
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {quality}
                    </Button>
                  </Link>
                ))
              ) : (
                <Link
                  href={`/download/movie/${params.id}?url=${encodeURIComponent(videoUrl)}&quality=${currentQuality}&title=${encodeURIComponent(movie?.title || "Movie")}`}
                >
                  <Button
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Current Quality
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

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
