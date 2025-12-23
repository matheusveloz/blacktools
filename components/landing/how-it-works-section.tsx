'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

export function HowItWorksSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        setShowControls(true)
      } else {
        // Garantir que o vídeo começa com som
        videoRef.current.muted = false
        setIsMuted(false)

        // Para mobile, garantir que o vídeo está pronto
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              // Esconder controles após 2 segundos
              setTimeout(() => setShowControls(false), 2000)
            })
            .catch((error) => {
              console.log('Play with sound was prevented:', error)
              // Se falhar com som, tentar com muted (requisito de alguns browsers mobile)
              if (videoRef.current) {
                videoRef.current.muted = true
                setIsMuted(true)
                videoRef.current.play().then(() => {
                  setIsPlaying(true)
                  setTimeout(() => setShowControls(false), 2000)
                }).catch(console.log)
              }
            })
        }
      }
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowControls(true)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const handleVideoClick = () => {
    if (isPlaying) {
      setShowControls(true)
      // Esconder novamente após 3 segundos se ainda estiver tocando
      setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          setShowControls(false)
        }
      }, 3000)
    }
    togglePlay()
  }

  const handleTouchStart = () => {
    if (isPlaying) {
      setShowControls(true)
      setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          setShowControls(false)
        }
      }, 3000)
    }
  }

  // Preload video metadata
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
    }
  }, [])

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            See it in action
          </h2>
          <p className="mt-4 text-neutral-500 text-lg">
            Our workflow editor makes video creation intuitive.
            Connect tools, generate content, export in minutes.
          </p>
        </div>

        {/* Video */}
        <div
          ref={containerRef}
          className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900/50 backdrop-blur-sm border border-white/5 cursor-pointer group"
          onClick={handleVideoClick}
          onTouchStart={handleTouchStart}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src="https://auth.blacktools.ai/storage/v1/object/public/videos/site/videoexplicativo.mp4"
            playsInline
            webkit-playsinline="true"
            muted={isMuted}
            preload="metadata"
            onEnded={handleVideoEnd}
            onPause={() => {
              setIsPlaying(false)
              setShowControls(true)
            }}
            onPlay={() => setIsPlaying(true)}
          />

          {/* Gradient overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/30 to-neutral-900/50" />
          )}

          {/* Play/Pause button overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 active:scale-95">
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
              )}
            </div>
          </div>

          {/* Mute button - only show when playing */}
          {isPlaying && (
            <button
              onClick={toggleMute}
              className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/70 transition-all duration-300 z-10 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* Bottom bar - hidden when playing */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${
              isPlaying ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 text-[10px] sm:text-xs md:text-sm text-neutral-400">
              <span className="whitespace-nowrap">1. Add tools</span>
              <span className="text-neutral-600">→</span>
              <span className="whitespace-nowrap">2. Connect</span>
              <span className="text-neutral-600">→</span>
              <span className="whitespace-nowrap">3. Generate</span>
              <span className="text-neutral-600">→</span>
              <span className="whitespace-nowrap">4. Download</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
