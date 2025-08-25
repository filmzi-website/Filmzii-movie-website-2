"use client"
import Player from "@/components/plyr-player"
import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Play } from "lucide-react"
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
  const [showPlayer, setShowPlayer] = useState(false) // New state to control player visibility

  useEffect(() => {
    const url = searchParams.get("url")
    const quality = searchParams.get("quality") || "720p"
    if (url) {
      setVideoUrl(decodeURIComponent(url))
      setCurrentQuality(quality)
      setPlayerKey(prev => prev + 1)
    }
    
    // Fetch movie details when component mounts
    if (params.id) {
      fetchMovieDetails(params.id as string)
    }
  }, [params.id, searchParams])

  const fetchMovieDetails = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`https://movie-database-nu-ashen.vercel.app/media/${id}`)
      const data = await response.json()
      setMovie(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching movie details:", error)
      setLoading(false)
    }
  }

  // Handle play button click
  const handlePlayClick = () => {
    setShowPlayer(true)
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

  if (!videoUrl && !movie?.video_links) {
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

  // Prepare sources for Player component
  const getPlayerSources = () => {
    if (movie?.video_links) {
      return [
        ...(movie.video_links["1080p"] ? [{ src: movie.video_links["1080p"], type: "video/mp4", size: 1080 }] : []),
        ...(movie.video_links["720p"] ? [{ src: movie.video_links["720p"], type: "video/mp4", size: 720 }] : []),
      ]
    }
    return [{ src: videoUrl, type: "video/mp4", size: Number.parseInt(currentQuality.replace("p", "")) }]
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Movie Title */}
          {movie && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">{movie.title}</h1>
              <div className="flex items-center space-x-4 text-gray-400">
                <span>{new Date(movie.release_date).getFullYear()}</span>
                <span>•</span>
                <span className="uppercase">{movie.language}</span>
              </div>
            </div>
          )}

          {/* Video Player Section */}
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
            {!showPlayer ? (
              /* Thumbnail with Play Button */
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                {movie?.poster_url && (
                  <Image
                    src={movie.poster_url}
                    alt={movie.title || "Movie poster"}
                    fill
                    className="object-cover opacity-60"
                    priority
                  />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Button
                    onClick={handlePlayClick}
                    className="bg-green-500 hover:bg-green-600 text-black w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Video Player */
              <div className="aspect-video">
                <Player
                  key={playerKey}
                  sources={getPlayerSources()}
                  poster={movie?.poster_url}
                  autoPlay={true}
                  preload="auto"
                  defaultQuality={720} // Set default to 720p
                />
              </div>
            )}
          </div>

          {/* Movie Info */}
          {movie && showPlayer && (
            <div className="mt-8 grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-4">About this movie</h2>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="font-semibold text-green-400">Release Date:</span>{" "}
                    {new Date(movie.release_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold text-green-400">Language:</span>{" "}
                    {movie.language.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Download Options</h3>
                {movie.video_links && (
                  <div className="space-y-2">
                    {movie.video_links["720p"] && (
                      <a
                        href={movie.video_links["720p"]}
                        download
                        className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download 720p</span>
                      </a>
                    )}
                    {movie.video_links["1080p"] && (
                      <a
                        href={movie.video_links["1080p"]}
                        download
                        className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download 1080p</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
