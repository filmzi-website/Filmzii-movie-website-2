"use client"

import { useEffect, useRef, useState } from "react"
import Plyr from "plyr"
import "plyr/dist/plyr.css"

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
  const playerInstance = useRef<Plyr | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userActivated, setUserActivated] = useState(false)

  const defaultSources: VideoSource[] = [
    {
      src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      type: "video/mp4",
      size: 720,
    },
  ]

  const videoSources = sources.length > 0 ? sources : defaultSources

  const initializePlayer = () => {
    if (!containerRef.current || isInitialized) return
    
    setUserActivated(true)
    setLoading(true)
    
    const videoElement = document.createElement("video")
    videoElement.playsInline = true
    if (poster) videoElement.poster = poster

    videoElement.addEventListener('waiting', () => setLoading(true))
    videoElement.addEventListener('playing', () => setLoading(false))
    videoElement.addEventListener('error', () => setLoading(false))

    videoSources.forEach((source) => {
      const sourceElement = document.createElement("source")
      sourceElement.src = source.src
      sourceElement.type = source.type
      if (source.size) {
        sourceElement.setAttribute("size", source.size.toString())
      }
      videoElement.appendChild(sourceElement)
    })

    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(videoElement)

    playerInstance.current = new Plyr(videoElement, {
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
      setIsInitialized(true)
      setLoading(false)
      playerInstance.current?.play().catch(() => { 
        // Autoplay prevented, but player is ready
      })
    })

    playerInstance.current.on("play", () => {
      setLoading(false)
    })
  }

  useEffect(() => {
    return () => {
      playerInstance.current?.destroy()
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden cursor-pointer"
      style={{ aspectRatio: "16/9" }}
      onClick={!userActivated ? initializePlayer : undefined}
    >
      {/* Poster with play button (before activation) */}
      {!userActivated && poster && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={poster} 
            alt="Movie poster" 
            className="absolute inset-0 w-full h-full object-cover"
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

      {/* Loading overlay */}
      {loading && (
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
