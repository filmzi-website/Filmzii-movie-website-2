"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Play, ArrowLeft, Calendar, Globe, Star, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Updated interface to match the new JSON structure
interface Movie {
  id: number
  type: "movie" | "tv"
  title: string
  description: string
  thumbnail: string
  release_date: string | null
  language: string
  rating: string
  cast_members: {
    character: string
    image: string
    name: string
  }[]
  video_links?: {
    "720p"?: string
    "1080p"?: string
    "2160p"?: string
  }
  download_links?: {
    "download_720p"?: { url: string; file_type: string }
    "download_1080p"?: { url: string; file_type: string }
    "download_2160p"?: { url: string; file_type: string }
  }
  seasons?: any
  total_seasons?: number
}

export default function MovieDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchMovieDetails(params.id as string)
    }
  }, [params.id])

  const fetchMovieDetails = async (id: string) => {
    try {
      // Changed API endpoint to the new one
      const response = await fetch(`https://databaseuiy.vercel.app/api/media/${id}`)
      const data: Movie = await response.json()

      // The new API returns the movie object directly if successful, or an error if not found.
      if (data && data.id) {
        setMovie(data)
      } else {
        setError("Movie not found")
      }
    } catch (error) {
      console.error("Error fetching movie details:", error)
      setError("Failed to load movie details")
    } finally {
      setLoading(false)
    }
  }

  const handleWatch = () => {
    // The video links are now nested under a `video_links` object
    if (movie?.video_links?.["1080p"] || movie?.video_links?.["720p"]) {
      const videoUrl = movie.video_links["1080p"] || movie.video_links["720p"]
      router.push(`/watch/${movie.type}/${movie.id}?url=${encodeURIComponent(videoUrl)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/3">
                <div className="bg-gray-800 aspect-[2/3] rounded-lg"></div>
              </div>
              <div className="w-full lg:w-2/3 space-y-4">
                <div className="bg-gray-800 h-8 rounded w-3/4"></div>
                <div className="bg-gray-800 h-4 rounded w-1/2"></div>
                <div className="bg-gray-800 h-32 rounded"></div>
                <div className="flex gap-4">
                  <div className="bg-gray-800 h-10 rounded w-24"></div>
                  <div className="bg-gray-800 h-10 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || "Movie not found"}</p>
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

      {/* Movie Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Movie Poster */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-gray-900 border-green-500/20 overflow-hidden">
              <CardContent className="p-0">
                {/* Changed from poster_url to thumbnail */}
                <Image
                  src={movie.thumbnail || "/placeholder.svg"}
                  alt={movie.title}
                  width={400}
                  height={600}
                  className="w-full aspect-[2/3] object-cover"
                />
              </CardContent>
            </Card>
          </div>

          {/* Movie Info */}
          <div className="w-full lg:w-2/3">
            <div className="space-y-6">
              {/* Title, Type, and Rating */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
                  <Badge className={`px-2 py-1 text-xs font-semibold rounded ${
                    movie.type === "movie" ? "bg-blue-500" : "bg-purple-500"
                  }`}>
                    {movie.type === "movie" ? "Movie" : "TV"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {/* Adjusted to handle the new date format */}
                    <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{movie.language}</span>
                  </div>
                  {/* Added a new element for rating */}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{movie.rating}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-green-400 mb-3">Overview</h2>
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">Watch & Download</h3>

                {/* Watch Button */}
                {(movie.video_links?.["720p"] || movie.video_links?.["1080p"] || movie.video_links?.["2160p"]) && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleWatch}
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold px-6 py-3"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                )}

                {/* Download Buttons */}
                {movie.download_links && (
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-white">Download Options:</h4>
                    <div className="flex flex-wrap gap-3">
                      {movie.download_links["download_720p"] && (
                        <Link
                          href={movie.download_links["download_720p"].url}
                          target="_blank"
                        >
                          <Button
                            variant="outline"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent px-6 py-3"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download 720p
                          </Button>
                        </Link>
                      )}
                      {movie.download_links["download_1080p"] && (
                        <Link
                          href={movie.download_links["download_1080p"].url}
                          target="_blank"
                        >
                          <Button
                            variant="outline"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent px-6 py-3"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download 1080p
                          </Button>
                        </Link>
                      )}
                      {movie.download_links["download_2160p"] && (
                        <Link
                          href={movie.download_links["download_2160p"].url}
                          target="_blank"
                        >
                          <Button
                            variant="outline"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent px-6 py-3"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download 2160p
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {!movie.video_links && !movie.download_links && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-400">Links are not available for this movie yet.</p>
                  </div>
                )}
              </div>

              {/* Cast Section */}
              {movie.cast_members && movie.cast_members.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-green-400 mb-3">Cast</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movie.cast_members.map((member, index) => (
                      <div key={index} className="flex flex-col items-center text-center">
                        <Image
                          src={member.image || "/placeholder-actor.svg"}
                          alt={member.name}
                          width={100}
                          height={100}
                          className="rounded-full object-cover w-20 h-20 mb-2"
                        />
                        <p className="font-medium text-white text-sm line-clamp-1">{member.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{member.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-900/50 rounded-lg p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Movie Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Release Date:</span>
                    <span className="text-white ml-2">{movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white ml-2">{movie.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-white ml-2">{movie.rating}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white ml-2">{movie.type === "movie" ? "Movie" : "TV Series"}</span>
                  </div>
                </div>
              </div>
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
