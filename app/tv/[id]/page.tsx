"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Play, ArrowLeft, Calendar, Globe, Star, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Episode {
  episode_number: number
  video_720p?: string
  video_1080p?: string
}

interface Season {
  season_number: number
  total_episodes: number
  episodes: Episode[]
}

interface TVSeries {
  id: number
  type: "tv"
  title: string
  description: string
  poster_url: string
  release_date: string
  language: string
  total_seasons: number
  tmdb_id: number
  seasons: Record<string, Season>
  created_at: string
}

export default function TVSeriesDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [tvSeries, setTVSeries] = useState<TVSeries | null>(null)
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
      const response = await fetch(`https://movie-database-real-working-mx21.vercel.app/media/${id}`)
      const data = await response.json()

      if (data.status === "success" && data.data.type === "tv") {
        setTVSeries(data.data)
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

  const handleDownload = (url: string, quality: string, season: number, episode: number) => {
    window.open(url, "_blank")
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
                  src={tvSeries.poster_url || "/placeholder.svg"}
                  alt={tvSeries.title}
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
                  <h1 className="text-4xl font-bold text-white">{tvSeries.title}</h1>
                  <Badge className="bg-purple-500 hover:bg-purple-600">TV Series</Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(tvSeries.release_date).getFullYear()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{tvSeries.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>
                      {tvSeries.total_seasons} Season{tvSeries.total_seasons > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-green-400 mb-3">Overview</h2>
                <p className="text-gray-300 leading-relaxed">{tvSeries.description}</p>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-900/50 rounded-lg p-6 border border-green-500/20">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Series Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Release Date:</span>
                    <span className="text-white ml-2">{new Date(tvSeries.release_date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Language:</span>
                    <span className="text-white ml-2">{tvSeries.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Seasons:</span>
                    <span className="text-white ml-2">{tvSeries.total_seasons}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Added:</span>
                    <span className="text-white ml-2">{new Date(tvSeries.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
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
                              {(episode.video_720p || episode.video_1080p) && (
                                <Button
                                  onClick={() =>
                                    handleWatch(
                                      episode.video_1080p || episode.video_720p!,
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
                              {episode.video_720p && (
                                <Button
                                  onClick={() =>
                                    handleDownload(
                                      episode.video_720p!,
                                      "720p",
                                      season.season_number,
                                      episode.episode_number,
                                    )
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  720p
                                </Button>
                              )}
                              {episode.video_1080p && (
                                <Button
                                  onClick={() =>
                                    handleDownload(
                                      episode.video_1080p!,
                                      "1080p",
                                      season.season_number,
                                      episode.episode_number,
                                    )
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  1080p
                                </Button>
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
