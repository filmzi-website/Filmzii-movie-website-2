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
  const [playerKey, setPlayerKey] = useState(0)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

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
      setLoading(true)
      const response = await fetch(`https://movie-database-nu-ashen.vercel.app/media/${id}`)
      const data = await response.json()

      if (data.status === "success") {
        setMovie(data.data)
        if (!videoUrl && data.data.video_links) {
          // Default to 720p if available
          const defaultUrl = data.data.video_links["720p"] || data.data.video_links["1080p"] || ""
          setVideoUrl(defaultUrl)
        }
      }
    } catch (error) {
      console.error("Error fetching movie details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQualityChange = (quality: string) => {
    if (movie?.video_links && movie.video_links[quality as keyof typeof movie.video_links]) {
      setVideoUrl(movie.video_links[quality as keyof typeof movie.video_links] || "")
      setCurrentQuality(quality)
      setPlayerKey(prev => prev + 1)
    }
  }

  const handlePlayerReady = () => {
    // Preload the video for faster playback
    const videoElement = document.querySelector('video')
    if (videoElement) {
      videoElement.preload = 'auto'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-32 h-8 bg-gray-800 rounded mb-4 mx-auto"></div>
          <div className="w-64 h-4 bg-gray-800 rounded mb-6 mx-auto"></div>
          <div className="w-48 h-12 bg-green-500/30 rounded mx-auto"></div>
        </div>
      </div>
    )
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
      <header className="border-b border-green-500/20 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="https://envs.sh/uiU.jpg" 
                alt="Filmzi Logo" 
                width={32} 
                height={32} 
                className="rounded-lg"
                priority
              />
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

          {/* Quality Selector */}
          {movie?.video_links && Object.keys(movie.video_links).length > 1 && (
            <div className="mb-4 flex space-x-2">
              {Object.keys(movie.video_links).map((quality) => (
                <Button
                  key={quality}
                  variant={currentQuality === quality ? "default" : "outline"}
                  className={`${
                    currentQuality === quality
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                  }`}
                  onClick={() => handleQualityChange(quality)}
                >
                  {quality}
                </Button>
              ))}
            </div>
          )}

          {/* Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <Player
              key={playerKey}
              sources={[{ src: videoUrl, type: "video/mp4" }]}
              poster={movie?.poster_url}
              onReady={handlePlayerReady}
              options={{
                controls: [
                  'play-large',
                  'play',
                  'progress',
                  'current-time',
                  'mute',
                  'volume',
                  'settings',
                  'pip',
                  'fullscreen',
                ],
                settings: ['quality', 'speed'],
                quality: {
                  default: 720,
                  options: [720, 1080],
                },
                speed: {
                  selected: 1,
                  options: [0.5, 0.75, 1, 1.25, 1.5, 2],
                },
              }}
            />
          </div>

          {/* Download Options */}
          {movie && (
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Download Options</h3>
              <div className="flex flex-wrap gap-3">
                {movie.video_links ? (
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
                    href={`/download/movie/${params.id}?url=${encodeURIComponent(videoUrl)}&quality=${currentQuality}&title=${encodeURIComponent(movie.title)}`}
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
          )}
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
