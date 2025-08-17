"use client"

import { useEffect, useRef, useState } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"
import Image from "next/image"

interface VideoSource {
  src: string
  type: string
  size?: number
}

interface PlayerProps {
  sources?: VideoSource[]
  poster?: string | null
}

const PlyrPlayer = ({ sources = [], poster = null }: PlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerInstance = useRef<Plyr | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const defaultSources: VideoSource[] = [
    {
      src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      type: "video/mp4",
      size: 720,
    },
  ]

  const videoSources = sources.length > 0 ? sources : defaultSources

  const initializePlayer = () => {
    if (!containerRef.current || !videoRef.current || playerInstance.current) return

    setIsLoading(true)
    
    try {
      playerInstance.current = new Plyr(videoRef.current, {
        controls: [
          "play-large", "play", "progress", "current-time", 
          "mute", "volume", "captions", "settings", 
          "pip", "airplay", "fullscreen"
        ],
        settings: ["quality", "speed"],
        quality: {
          default: videoSources[0]?.size || 720,
          options: videoSources.map((source) => source.size),
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 2],
        },
      })

      playerInstance.current.on("ready", () => {
        setIsReady(true)
        setIsLoading(false)
      })

      playerInstance.current.on("play", () => setIsPlaying(true))
      playerInstance.current.on("pause", () => setIsPlaying(false))
      playerInstance.current.on("waiting", () => setIsLoading(true))
      playerInstance.current.on("playing", () => setIsLoading(false))
      playerInstance.current.on("error", () => setIsLoading(false))

    } catch (error) {
      console.error("Player initialization error:", error)
      setIsLoading(false)
    }
  }

  const handlePlayClick = () => {
    if (!isReady) {
      initializePlayer()
    }
    playerInstance.current?.play().catch(error => {
      console.log("Playback failed:", error)
    })
  }

  useEffect(() => {
    return () => {
      playerInstance.current?.destroy()
      playerInstance.current = null
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster || undefined}
        playsInline
        controls={false}
        className={`w-full h-full ${isReady ? 'block' : 'hidden'}`}
      >
        {videoSources.map((source, index) => (
          <source
            key={`source-${index}`}
            src={source.src}
            type={source.type}
            size={source.size}
          />
        ))}
      </video>

      {/* Poster with Play Button */}
      {(!isReady || !isPlaying) && poster && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayClick}
        >
          <Image
            src={poster}
            alt="Movie poster"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-20 h-20 bg-green-500/90 hover:bg-green-400 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-10">
              <svg className="w-10 h-10 text-white ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-green-400 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlyrPlayer
