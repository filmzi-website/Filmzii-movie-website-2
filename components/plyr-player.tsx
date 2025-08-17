"use client"

import { useEffect, useRef } from "react"
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

const Player = ({ sources = [], poster = null }: PlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerInstance = useRef<Plyr | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Default sources if none provided
  const defaultSources: VideoSource[] = [
    {
      src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      type: "video/mp4",
      size: 720,
    },
  ]

  const videoSources = sources.length > 0 ? sources : defaultSources

  useEffect(() => {
    if (!videoRef.current || !containerRef.current) return

    // Initialize Plyr player
    playerInstance.current = new Plyr(videoRef.current, {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "captions",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
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
      keyboard: { focused: true, global: true },
      fullscreen: { enabled: true, iosNative: false },
    })

    // Handle autoplay
    playerInstance.current.on("ready", () => {
      // Hide HTML5 video element until Plyr is ready
      containerRef.current?.classList.remove('opacity-0')
      playerInstance.current?.play().catch((e) => {
        console.log("Auto-play prevented:", e)
      })
    })

    // Clean up on unmount
    return () => {
      playerInstance.current?.destroy()
      playerInstance.current = null
    }
  }, [videoSources])

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-xl opacity-0 transition-opacity duration-300"
    >
      <video
        ref={videoRef}
        poster={poster || undefined}
        playsInline
        controls={false}
        className="w-full"
      >
        {videoSources.map((source, index) => (
          <source
            key={`source-${index}`}
            src={source.src}
            type={source.type}
            size={source.size}
          />
        ))}
        {/* Removed HTML5 fallback text to prevent blurry overlay */}
      </video>
    </div>
  )
}

export default Player
