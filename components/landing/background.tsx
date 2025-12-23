'use client'

export function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* 3D Perspective Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 50%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 50%)',
        }}
      />

      {/* Green spray effect - top left */}
      <div
        className="absolute -top-20 -left-20 w-[600px] h-[600px]"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 60% 40%, rgba(34, 197, 94, 0.1) 0%, transparent 30%),
            radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.08) 0%, transparent 35%)
          `,
          filter: 'blur(40px)',
        }}
      />

      {/* Green spray effect - top right */}
      <div
        className="absolute -top-10 right-0 w-[500px] h-[500px]"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(34, 197, 94, 0.12) 0%, transparent 35%),
            radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.06) 0%, transparent 40%)
          `,
          filter: 'blur(50px)',
        }}
      />

      {/* Green spray effect - middle */}
      <div
        className="absolute top-[40%] left-[20%] w-[400px] h-[400px]"
        style={{
          background: `
            radial-gradient(circle at center, rgba(34, 197, 94, 0.06) 0%, transparent 50%)
          `,
          filter: 'blur(60px)',
        }}
      />

      {/* Green spray effect - bottom right */}
      <div
        className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px]"
        style={{
          background: `
            radial-gradient(circle at 60% 60%, rgba(34, 197, 94, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 30% 40%, rgba(34, 197, 94, 0.05) 0%, transparent 35%)
          `,
          filter: 'blur(50px)',
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
