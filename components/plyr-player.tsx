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
  const [isReady, setIsReady] = useState(false)

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
    if (!containerRef.current) return

    // Clean up previous instance
    if (playerInstance.current) {
      playerInstance.current.destroy()
      playerInstance.current = null
    }

    // Create video element
    const videoElement = document.createElement("video")
    videoElement.playsInline = true
    if (poster) videoElement.poster = poster

    // Add sources
    videoSources.forEach((source) => {
      const sourceElement = document.createElement("source")
      sourceElement.src = source.src
      sourceElement.type = source.type
      if (source.size) {
        sourceElement.setAttribute("size", source.size.toString())
      }
      videoElement.appendChild(sourceElement)
    })

    // Add to DOM
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(videoElement)

    // Initialize Plyr
    playerInstance.current = new Plyr(videoElement, {
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

    // Handle ready state
    playerInstance.current.on("ready", () => {
      setIsReady(true)
      // Attempt autoplay (will fail without user interaction)
      playerInstance.current?.play().catch(() => {
        // Autoplay was prevented, this is normal
      })
    })

    // Handle errors
    playerInstance.current.on("error", (event) => {
      console.error("Plyr error:", event.detail)
    })

    // Clean up
    return () => {
      playerInstance.current?.destroy()
      playerInstance.current = null
    }
  }, [videoSources, poster])

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-black rounded-lg overflow-hidden transition-opacity duration-300 ${isReady ? "opacity-100" : "opacity-0"}`}
      style={{ aspectRatio: "16/9" }}
    />
  )
}

export default PlyrPlayer
