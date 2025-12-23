'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface GalleryItem {
  id: number
  type: 'video' | 'image'
  label: string
  src: string
  alt: string
}

// Videos only - with SEO-optimized alt texts
const videoItems: GalleryItem[] = [
  {
    id: 1,
    type: 'video',
    label: 'InfiniteTalk',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/videos/site/Infinite_Talk__10s__1766291965465.mp4',
    alt: 'InfiniteTalk AI talking avatar video example'
  },
  {
    id: 2,
    type: 'video',
    label: 'InfiniteTalk',
    src: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/videos/site/infinit1.mp4',
    alt: 'InfiniteTalk AI video generator demo'
  },
  {
    id: 3,
    type: 'video',
    label: 'Sora 2',
    src: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/videos/site/sora1_novo.mp4',
    alt: 'Sora 2 AI text-to-video generation example'
  },
  {
    id: 4,
    type: 'video',
    label: 'Veo 3.1',
    src: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/videos/site/veo3.mp4',
    alt: 'Google Veo 3 AI generated video demo'
  },
  {
    id: 5,
    type: 'video',
    label: 'LipSync',
    src: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/videos/site/lipsync.mp4',
    alt: 'AI LipSync video synchronization example'
  },
  {
    id: 6,
    type: 'video',
    label: 'Sora 2',
    src: 'https://cgazpevtuovdlcecnznc.supabase.co/storage/v1/object/public/videos/site/sora2_novo.mp4',
    alt: 'Sora 2 AI video creation demo'
  },
]

// Avatar images - with SEO-optimized alt texts
const avatarImages: GalleryItem[] = [
  {
    id: 1,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/17572cec-b0d4-41c5-8319-4760191ba93b-1766266774616.jpg',
    alt: 'Hyper-realistic AI avatar woman'
  },
  {
    id: 2,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/O000.png',
    alt: 'Photorealistic AI generated avatar'
  },
  {
    id: 3,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o1.jpg',
    alt: 'AI avatar generator example'
  },
  {
    id: 4,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o10.png',
    alt: 'Realistic AI generated person'
  },
  {
    id: 5,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o12.png',
    alt: 'AI digital human avatar'
  },
  {
    id: 6,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o2.jpg',
    alt: 'Photorealistic AI avatar woman'
  },
  {
    id: 7,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o201.png',
    alt: 'AI avatar creator output'
  },
  {
    id: 8,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o23.png',
    alt: 'Hyper-realistic AI generated face'
  },
  {
    id: 9,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o30.png',
    alt: 'AI virtual human avatar'
  },
  {
    id: 10,
    type: 'image',
    label: 'AI Avatar',
    src: 'https://auth.blacktools.ai/storage/v1/object/public/images/site/realista/o47.png',
    alt: 'Professional AI avatar example'
  },
]

function VideoCard({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [thumbnail, setThumbnail] = useState<string | null>(null)

  const captureThumbnail = () => {
    if (!videoRef.current || thumbnail) return

    const video = videoRef.current
    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 400
      canvas.height = video.videoHeight || 500
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        setThumbnail(canvas.toDataURL('image/jpeg', 0.8))
      }
    } catch {
      // CORS or other error
    }
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  return (
    <div
      className="relative flex-shrink-0 w-[220px] sm:w-[280px] md:w-[320px] aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900/50 backdrop-blur-sm border border-white/5 cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpen}
    >
      {/* Thumbnail for mobile */}
      {thumbnail && !isHovered && (
        <img
          src={thumbnail}
          alt={item.alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <video
        ref={videoRef}
        src={`${item.src}#t=0.001`}
        className={`absolute inset-0 w-full h-full object-cover ${thumbnail && !isHovered ? 'opacity-0' : 'opacity-100'}`}
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onLoadedData={captureThumbnail}
      />

      {/* Play icon overlay */}
      <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
          <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white ml-0.5" />
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
        <span className="text-[10px] sm:text-xs font-medium text-white/80 uppercase tracking-wider bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
          {item.label}
        </span>
      </div>

      {/* Hover overlay */}
      <div className={`absolute inset-0 bg-white/5 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

function ImageCard({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  return (
    <div
      className="relative flex-shrink-0 w-[200px] sm:w-[260px] md:w-[300px] aspect-[9/16] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900/50 backdrop-blur-sm border border-white/5 cursor-pointer group hover:border-white/20 transition-all"
      onClick={onOpen}
    >
      <Image
        src={item.src}
        alt={item.alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="300px"
      />

      {/* Zoom icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}

function MediaModal({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  if (!item) return null

  const handleWheel = (e: React.WheelEvent) => {
    if (item.type !== 'image') return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setScale(prev => Math.min(Math.max(prev + delta, 1), 5))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (item.type !== 'image' || scale <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 5))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.5, 1))
    if (scale <= 1.5) setPosition({ x: 0, y: 0 })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={() => { resetZoom(); onClose(); }}
    >
      <div
        className="relative flex flex-col items-center justify-center w-full h-full"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Close button */}
        <button
          onClick={() => { resetZoom(); onClose(); }}
          className="absolute top-4 right-4 z-20 p-2 sm:p-3 bg-black/70 backdrop-blur-sm rounded-full text-white/90 hover:text-white hover:bg-black/90 transition-all shadow-lg"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Zoom controls for images */}
        {item.type === 'image' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 1}
              className={`p-1 rounded-full transition-all ${scale <= 1 ? 'text-white/30' : 'text-white hover:bg-white/20'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-white text-sm font-medium min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              disabled={scale >= 5}
              className={`p-1 rounded-full transition-all ${scale >= 5 ? 'text-white/30' : 'text-white hover:bg-white/20'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {scale > 1 && (
              <button
                onClick={resetZoom}
                className="ml-2 px-2 py-0.5 text-xs text-white/80 hover:text-white bg-white/10 rounded transition-all"
              >
                Reset
              </button>
            )}
          </div>
        )}

        {/* Media container */}
        <div className="relative flex items-center justify-center w-full h-full overflow-hidden p-4 sm:p-8">
          {item.type === 'video' ? (
            <video
              src={item.src}
              className="max-w-full max-h-[85vh] rounded-xl sm:rounded-2xl bg-black"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div
              className={`transition-transform duration-200 ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'}`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
              onClick={() => scale === 1 && zoomIn()}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={800}
                height={1422}
                className="max-h-[85vh] w-auto object-contain rounded-xl sm:rounded-2xl select-none"
                draggable={false}
                priority
              />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="absolute bottom-4 left-4 z-20">
          <span className="text-sm font-medium text-white/90 uppercase tracking-wider bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            {item.label}
          </span>
        </div>

        {/* Zoom hint for images */}
        {item.type === 'image' && scale === 1 && (
          <div className="absolute bottom-4 right-4 z-20 text-white/50 text-xs bg-black/50 px-3 py-1.5 rounded-full">
            Scroll or click to zoom
          </div>
        )}
      </div>
    </div>
  )
}

interface CarouselProps {
  title: string
  description?: string
  items: GalleryItem[]
  onSelectItem: (item: GalleryItem) => void
  type: 'video' | 'image'
}

function Carousel({ title, description, items, onSelectItem, type }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = type === 'video' ? 340 : 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 px-4 sm:px-6">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 sm:p-3 rounded-full border transition-all ${
              canScrollLeft
                ? 'border-white/20 hover:border-white/50 hover:bg-white/10 text-white'
                : 'border-white/10 text-white/30 cursor-not-allowed'
            }`}
            aria-label="Previous videos"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 sm:p-3 rounded-full border transition-all ${
              canScrollRight
                ? 'border-white/20 hover:border-white/50 hover:bg-white/10 text-white'
                : 'border-white/10 text-white/30 cursor-not-allowed'
            }`}
            aria-label="Next videos"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          type === 'video' ? (
            <VideoCard
              key={item.id}
              item={item}
              onOpen={() => onSelectItem(item)}
            />
          ) : (
            <ImageCard
              key={item.id}
              item={item}
              onOpen={() => onSelectItem(item)}
            />
          )
        ))}
      </div>
    </div>
  )
}

export function GallerySection() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  return (
    <>
      {/* Video Carousel - UGC Ads */}
      <section className="py-12 sm:py-20" aria-labelledby="ugc-videos-heading">
        <div className="max-w-7xl mx-auto">
          <Carousel
            title="Create UGC Ads in 60 Seconds with AI"
            description="AI-powered video generation with Sora 2, Veo 3, LipSync and InfiniteTalk. Perfect for TikTok, Reels and Shorts."
            items={videoItems}
            onSelectItem={setSelectedItem}
            type="video"
          />
        </div>
      </section>

      {/* Avatar Carousel - Hyper-Realistic */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent" aria-labelledby="ai-avatars-heading">
        <div className="max-w-7xl mx-auto">
          <Carousel
            title="AI Avatar Generator — Hyper-Realistic Digital Humans"
            description="Create photorealistic AI avatars for ads, e-commerce and social media. No models needed."
            items={avatarImages}
            onSelectItem={setSelectedItem}
            type="image"
          />
        </div>
      </section>

      {/* Modal */}
      {selectedItem && (
        <MediaModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </>
  )
}
