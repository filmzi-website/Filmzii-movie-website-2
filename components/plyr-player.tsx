"use client"

import { useEffect, useRef } from "react"

const Player = ({ sources = [], poster = null }) => {
  const videoRef = useRef(null)
  const playerRef = useRef(null)

  // Default sources if none provided (for demo)
  const defaultSources = [
    {
      src: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      type: "video/mp4",
      size: 720,
    },
  ]

  const videoSources = sources.length > 0 ? sources : defaultSources

  useEffect(() => {
    const initializePlyr = async () => {
      if (!videoRef.current) return

      try {
        const Plyr = (await import("plyr")).default
        await import("plyr/dist/plyr.css")

        // Initialize Plyr player
        playerRef.current = new Plyr(videoRef.current, {
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
            forced: true,
          },
          speed: {
            selected: 1,
            options: [0.5, 0.75, 1, 1.25, 1.5, 2],
          },
          keyboard: { focused: true, global: true },
          tooltips: { controls: true, seek: true },
          fullscreen: { enabled: true, fallback: true, iosNative: false },
          storage: { enabled: true, key: "plyr" },
        })

        playerRef.current.on("ready", () => {
          playerRef.current.play().catch((e) => {
            console.log("Auto-play prevented:", e)
          })
        })
      } catch (error) {
        console.error("Failed to initialize Plyr:", error)
      }
    }

    initializePlyr()

    // Clean up on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoSources])

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-xl">
      <video ref={videoRef} poster={poster} controls playsInline className="w-full">
        {videoSources.map((source, index) => (
          <source key={index} src={source.src} type={source.type} size={source.size} />
        ))}
        {/* Fallback text */}
        <track kind="captions" label="English" srcLang="en" default />
        Your browser doesn't support HTML5 video.
      </video>
    </div>
  )
}

export default Player
