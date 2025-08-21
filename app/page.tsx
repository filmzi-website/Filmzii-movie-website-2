"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, Play, MessageCircle, Send } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Movie {
  id: number
  type: "movie" | "tv"
  title: string
  description: string
  poster_url: string
  release_date: string
  language: string
  video_links?: {
    "720p": string
    "1080p": string
  }
  seasons?: any
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [tvSeries, setTvSeries] = useState<Movie[]>([])
  const [heroMovies, setHeroMovies] = useState<Movie[]>([])
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])

  useEffect(() => {
    fetchMovies()
  }, [])

  useEffect(() => {
    if (heroMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [heroMovies.length])

  const fetchMovies = async () => {
    try {
      const response = await fetch("https://movie-database-nu-ashen.vercel.app/media")
      const data = await response.json()
      if (data.status === "success") {
        const allMedia = data.data

        // Sort all media by ID (latest added first - assuming higher ID = newer)
        const sortedByLatest = allMedia.sort((a: Movie, b: Movie) => b.id - a.id)

        // Extract movies and TV series from sorted data
        const allMovies = sortedByLatest.filter((item: Movie) => item.type === "movie")
        const allTV = sortedByLatest.filter((item: Movie) => item.type === "tv")

        // Filter 2025 movies for hero section (from latest added)
        const movies2025 = allMovies.filter(movie => 
          movie.release_date?.startsWith("2025")
        );
        
        // Use 2025 movies for hero, fallback to latest movies if no 2025 content
        const heroCandidates = movies2025.length > 0 ? movies2025.slice(0, 7) : allMovies.slice(0, 7)
        setHeroMovies(heroCandidates)

        // Get 2025 content for main sections (latest added first)
        const movies2025Latest = allMovies.filter(
          (item: Movie) => item.release_date?.startsWith("2025")
        );
        const tv2025Latest = allTV.filter(
          (item: Movie) => item.release_date?.startsWith("2025")
        );

        // Use 2025 content if available, otherwise show latest added content
        setMovies(movies2025Latest.length > 0 ? movies2025Latest : allMovies.slice(0, 50))
        setTvSeries(tv2025Latest.length > 0 ? tv2025Latest : allTV.slice(0, 50))

        console.log(`Latest Movies (2025):`, movies2025Latest.length)
        console.log("Hero movies:", heroCandidates.length)
      }
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `https://movie-database-nu-ashen.vercel.app/search?q=${encodeURIComponent(query)}`,
      )
      const data = await response.json()
      if (data.status === "success") {
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error("Error searching:", error)
    }
  }

  const MovieGrid = ({ title, items, loading }: { title: string; items: Movie[]; loading: boolean }) => {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-green-400">{title}</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-800 aspect-[2/3] rounded-lg mb-3"></div>
                  <div className="bg-gray-800 h-4 rounded mb-2"></div>
                  <div className="bg-gray-800 h-3 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {items.map((movie) => (
                <Link key={movie.id} href={`/${movie.type}/${movie.id}`} className="block">
                  <Card className="bg-gray-900 border-green-500/20 hover:border-green-400/50 transition-all duration-300 group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <Image
                          src={movie.poster_url || "/placeholder.svg"}
                          alt={movie.title}
                          width={200}
                          height={300}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex flex-col space-y-2">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-black w-full"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Watch
                            </Button>
                            {movie.video_links && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500 text-green-400 hover:bg-green-500/10 bg-transparent w-full"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${
                              movie.type === "movie" ? "bg-blue-500" : "bg-purple-500"
                            }`}
                          >
                            {movie.type === "movie" ? "Movie" : "TV"}
                          </span>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-white mb-1 text-sm line-clamp-2">{movie.title}</h4>
                        <p className="text-xs text-gray-400 mb-1">{movie.release_date?.split("-")[0]}</p>
                        <p className="text-xs text-green-400">{movie.language}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No content available.</p>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Image
                src="https://envs.sh/uiU.jpg"
                alt="Filmzi Logo"
                width={32}
                height={32}
                className="rounded-lg md:w-10 md:h-10"
              />
              <h1 className="text-xl md:text-2xl font-bold text-green-400">Filmzi</h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative">
                <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  className="pl-8 md:pl-10 bg-gray-900 border-green-500/30 text-white placeholder-gray-400 focus:border-green-400 w-32 md:w-64 text-sm"
                />
              </div>

              <div className="hidden md:flex items-center space-x-2">
                <Link href="https://t.me/filmzi2" target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Telegram
                  </Button>
                </Link>
                <Link href="https://chat.whatsapp.com/KNE7Dzo1eFcKDA2Q6oDfFO?mode=ac_t" target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex md:hidden justify-center space-x-4 mt-3 pt-3 border-t border-green-500/20">
            <Link href="https://t.me/filmzi2" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
              >
                <Send className="w-4 h-4 mr-1" />
                Telegram
              </Button>
            </Link>
            <Link href="https://chat.whatsapp.com/KNE7Dzo1eFcKDA2Q6oDfFO?mode=ac_t" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!searchQuery && heroMovies.length > 0 && (
        <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={heroMovies[currentHeroIndex]?.poster_url || "/placeholder.svg"}
              alt={heroMovies[currentHeroIndex]?.title || "Hero Movie"}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
          </div>

          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white">{heroMovies[currentHeroIndex]?.title}</h2>
              <p className="text-lg md:text-xl text-gray-300 mb-6 line-clamp-3">
                {heroMovies[currentHeroIndex]?.description}
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <Link href={`/movie/${heroMovies[currentHeroIndex]?.id}`}>
                  <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent px-8 py-3"
                >
                  More Info
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentHeroIndex ? "bg-green-500" : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>
      )}

      {!searchQuery && heroMovies.length === 0 && (
        <section className="bg-gradient-to-b from-green-900/20 to-black py-8 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-green-400">Welcome to Filmzi</h2>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
              Stream & Download Movies and TV Series in HD Quality
            </p>
            <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 md:px-6 py-2 md:py-3">
                <span className="text-green-400 font-semibold text-sm md:text-base">720p & 1080p Quality</span>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 md:px-6 py-2 md:py-3">
                <span className="text-green-400 font-semibold text-sm md:text-base">Free Streaming</span>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 md:px-6 py-2 md:py-3">
                <span className="text-green-400 font-semibold text-sm md:text-base">Latest Releases</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {searchQuery ? (
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-green-400">
              Search Results for "{searchQuery}"
            </h3>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800 aspect-[2/3] rounded-lg mb-3"></div>
                    <div className="bg-gray-800 h-4 rounded mb-2"></div>
                    <div className="bg-gray-800 h-3 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {searchResults.map((movie) => (
                  <Link key={movie.id} href={`/${movie.type}/${movie.id}`}>
                    <Card className="bg-gray-900 border-green-500/20 hover:border-green-400/50 transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <Image
                            src={movie.poster_url || "/placeholder.svg"}
                            alt={movie.title}
                            width={300}
                            height={450}
                            className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-black"
                                onClick={(e) => e.preventDefault()}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Watch
                              </Button>
                              {movie.video_links && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-green-500 text-green-400 hover:bg-green-500/10 bg-transparent"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                movie.type === "movie" ? "bg-blue-500" : "bg-purple-500"
                              }`}
                            >
                              {movie.type === "movie" ? "Movie" : "TV Series"}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 md:p-4">
                          <h4 className="font-semibold text-white mb-2 line-clamp-2 text-sm md:text-base">
                            {movie.title}
                          </h4>
                          <p className="text-xs md:text-sm text-gray-400 mb-2">{movie.release_date?.split("-")[0]}</p>
                          <p className="text-xs text-green-400">{movie.language}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {!loading && searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No results found for your search.</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <MovieGrid title="Latest Movies 2025" items={movies} loading={loading} />
          <MovieGrid title="Latest TV Series 2025" items={tvSeries} loading={loading} />
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-green-500/20 py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Image src="https://envs.sh/uiU.jpg" alt="Filmzi Logo" width={32} height={32} className="rounded-lg" />
              <h3 className="text-xl font-bold text-green-400">Filmzi</h3>
            </div>

            <div className="flex justify-center space-x-6 mb-6">
              <Link
                href="https://t.me/filmzi2"
                target="_blank"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <Send className="w-5 h-5" />
              </Link>
              <Link
                href="https://chat.whatsapp.com/KNE7Dzo1eFcKDA2Q6oDfFO?mode=ac_t"
                target="_blank"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
            </div>

            <div className="border-t border-green-500/20 pt-6">
              <p className="text-gray-400 text-sm mb-2">© 2025 Filmzi. All rights reserved.</p>
              <p className="text-gray-500 text-xs max-w-2xl mx-auto">
                Our website does not host any movie links or movies on our servers. Everything is from third party
                sources. We are not responsible for any content.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
