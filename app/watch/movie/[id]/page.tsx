"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Maximize, Volume2, Settings } from "lucide-react"
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [currentQuality, setCurrentQuality] = useState<string>("720p")
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

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

  const switchQuality = (quality: string) => {
    if (movie?.video_links && videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const wasPlaying = !videoRef.current.paused

      setVideoUrl(movie.video_links[quality as keyof typeof movie.video_links] || "")
      setCurrentQuality(quality)
      setShowQualityMenu(false)

      // Restore playback position after quality change
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime
          if (wasPlaying) {
            videoRef.current.play()
          }
        }
      }, 100)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number.parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number.parseFloat(e.target.value)
    setVolume(vol)
    if (videoRef.current) {
      videoRef.current.volume = vol
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
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

          {/* Video Player Container */}
          <div className="relative bg-black rounded-lg overflow-hidden border border-green-500/20">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls={false}
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`,
                  }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button onClick={togglePlay} size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                    {isPlaying ? "Pause" : "Play"}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-white" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <span className="text-sm text-gray-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {movie?.video_links && (
                    <div className="relative">
                      <Button
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {currentQuality}
                      </Button>

                      {showQualityMenu && (
                        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-green-500/30 rounded-lg overflow-hidden">
                          {Object.keys(movie.video_links).map((quality) => (
                            <button
                              key={quality}
                              onClick={() => switchQuality(quality)}
                              className={`block w-full px-3 py-2 text-left hover:bg-green-500/10 ${
                                currentQuality === quality ? "bg-green-500/20 text-green-400" : "text-white"
                              }`}
                            >
                              {quality}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={toggleFullscreen}
                    size="sm"
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
            <h3 className="text-lg font-semibold text-green-400 mb-3">Download Options</h3>
            <div className="flex flex-wrap gap-3">
              {movie?.video_links ? (
                Object.entries(movie.video_links).map(([quality, url]) => (
                  <Button
                    key={quality}
                    onClick={() => window.open(url, "_blank")}
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {quality}
                  </Button>
                ))
              ) : (
                <Button
                  onClick={() => window.open(videoUrl, "_blank")}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Current Quality
                </Button>
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
