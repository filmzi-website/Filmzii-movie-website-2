"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Play, ArrowLeft, Calendar, Globe, Star, ChevronDown, ChevronUp, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Episode {
  episode_number: number
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
}

interface Season {
  season_number: number
  total_episodes: number
  episodes: Episode[]
}

interface TVSeries {
  id: number
  type: string
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
  seasons: Record<string, Season>
  total_seasons: number
}

export default function TVSeriesDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [tvSeries, setTVSeries] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1]))

  useEffect(() => {
    if (params.id) {
      fetchTVSeriesDetails(params.id as string)
    }
  }, [params.id])

  const fetchTVSeriesDetails = async (id: string) => {
    try {
      // New API endpoint for media details
      const response = await fetch(`https://databaseuiy.vercel.app/api/media/${id}`)
      const data: TVSeries = await response.json()

      if (data && data.id) {
        setTVSeries(data)
      } else {
        setError("TV Series not found")
      }
    } catch (error) {
      console.error("Error fetching TV series details:", error)
      setError("Failed to load TV series details")
    } finally {
      setLoading(false)
    }
  }

  const toggleSeason = (seasonNumber: number) => {
    const newExpanded = new Set(expandedSeasons)
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber)
    } else {
      newExpanded.add(seasonNumber)
    }
    setExpandedSeasons(newExpanded)
  }

  const handleWatch = (videoUrl: string, season: number, episode: number) => {
    router.push(`/watch/tv/${tvSeries?.id}?url=${encodeURIComponent(videoUrl)}&season=${season}&episode=${episode}`)
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
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tvSeries) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || "TV Series not found"}</p>
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

  const seasonNumbers = tvSeries?.seasons
    ? Object.values(tvSeries.seasons).map(season => season.season_number)
    : [];
  const maxSeasonNumber = seasonNumbers.length > 0 ? Math.max(...seasonNumbers) : 0;

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

      {/* TV Series Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* TV Series Poster */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-gray-900 border-green-500/20 overflow-hidden">
              <CardContent className="p-0">
                <Image
                  // Updated from poster_url to thumbnail
                  src={tvSeries?.thumbnail || "/placeholder.svg"}
                  alt={tvSeries?.title || "TV Series"}
                  width={400}
                  height={600}
                  className="w-full aspect-[2/3] object-cover"
                />
              </CardContent>
            </Card>
          </div>

          {/* TV Series Info */}
          <div className="w-full lg:w-2/3">
            <div className="space-y-6">
              {/* Title and Type */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">{tvSeries?.title}</h1>
                  <Badge className="bg-purple-500 hover:bg-purple-600">TV Series</Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {/* Adjusted to handle the new date format */}
                    <span>{tvSeries?.release_date ? new Date(tvSeries.release_date).getFullYear() : "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{tvSeries?.language || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>{tvSeries?.rating || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronUp className="w-4 h-4" />
                    <span>
                      {maxSeasonNumber} Season
                      {maxSeasonNumber > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-green-400 mb-3">Overview</h2>
                <p className="text-gray-300 leading-relaxed">{tvSeries?.description || "No description available."}</p>
              </div>

              {/* Cast Section */}
              {tvSeries?.cast_members && tvSeries.cast_members.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-green-400 mb-3">Cast</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {tvSeries.cast_members.map((member: any, index: number) => (
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
                <h3 className="text-lg font-semibold text-green-400 mb-4">Series Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Release Date:</span>
                    <span className="text-white ml-2">
                      {tvSeries?.release_date ? new Date(tvSeries.release_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white ml-2">{tvSeries?.language || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Seasons:</span>
                    <span className="text-white ml-2">
                      {maxSeasonNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Rating:</span>
                    <span className="text-white ml-2">{tvSeries?.rating || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        {tvSeries?.seasons && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-green-400 mb-6">Episodes</h2>
            <div className="space-y-4">
              {Object.entries(tvSeries.seasons).map(([seasonKey, season]) => (
                <Card key={seasonKey} className="bg-gray-900 border-green-500/20">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleSeason(season.season_number)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">Season {season.season_number}</h3>
                        <Badge variant="outline" className="border-green-500/30 text-green-400">
                          {season.total_episodes} Episodes
                        </Badge>
                      </div>
                      {expandedSeasons.has(season.season_number) ? (
                        <ChevronUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-green-400" />
                      )}
                    </button>

                    {expandedSeasons.has(season.season_number) && (
                      <div className="border-t border-green-500/20">
                        {season.episodes.map((episode) => (
                          <div key={episode.episode_number} className="p-4 border-b border-gray-800 last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white mb-1">Episode {episode.episode_number}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* WATCH BUTTONS (from video_links) */}
                                {(episode.video_links?.["720p"] || episode.video_links?.["1080p"] || episode.video_links?.["2160p"]) && (
                                  <Button
                                    onClick={() =>
                                      handleWatch(
                                        episode.video_links?.["1080p"] || episode.video_links?.["720p"] || episode.video_links?.["2160p"]!,
                                        season.season_number,
                                        episode.episode_number,
                                      )
                                    }
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-black"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Watch
                                  </Button>
                                )}

                                {/* DOWNLOAD BUTTONS (from download_links) */}
                                {episode.download_links && (
                                  <>
                                    {episode.download_links["download_720p"] && (
                                      <Link href={episode.download_links["download_720p"].url} target="_blank">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                                        >
                                          <Download className="w-4 h-4 mr-1" />
                                          720p
                                        </Button>
                                      </Link>
                                    )}
                                    {episode.download_links["download_1080p"] && (
                                      <Link href={episode.download_links["download_1080p"].url} target="_blank">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                                        >
                                          <Download className="w-4 h-4 mr-1" />
                                          1080p
                                        </Button>
                                      </Link>
                                    )}
                                    {episode.download_links["download_2160p"] && (
                                      <Link href={episode.download_links["download_2160p"].url} target="_blank">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
                                        >
                                          <Download className="w-4 h-4 mr-1" />
                                          2160p
                                        </Button>
                                      </Link>
                                    )}
                                  </>
                                )}

                                {!episode.video_links && !episode.download_links && (
                                  <span className="text-sm text-gray-500">Links not available</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
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
