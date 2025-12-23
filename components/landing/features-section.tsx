'use client'

const tools = [
  {
    name: 'Sora 2',
    description: 'Text-to-video generation with cinematic quality.',
  },
  {
    name: 'Veo 3.1',
    description: 'High-fidelity video synthesis for any style.',
  },
  {
    name: 'LipSync',
    description: 'Perfect audio-visual synchronization.',
  },
  {
    name: 'NanoBanana 2',
    description: 'Generate unique digital characters and avatars.',
  },
  {
    name: 'InfiniteTalk',
    description: 'Endless AI-powered conversations and voiceovers.',
  },
  {
    name: 'And more...',
    description: 'New tools added regularly. Stay tuned.',
    isMore: true,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
            Tools
          </h2>
          <p className="mt-4 text-neutral-500 text-lg">
            Everything you need in one place.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className={`p-8 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
                'isMore' in tool && tool.isMore
                  ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <h3 className={`text-xl font-medium mb-2 ${'isMore' in tool && tool.isMore ? 'text-emerald-400' : ''}`}>
                {tool.name}
              </h3>
              <p className="text-neutral-500">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
