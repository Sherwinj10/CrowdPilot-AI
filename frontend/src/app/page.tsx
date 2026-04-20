import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden bg-[#0A0A0A]">
      
      {/* Cinematic Background Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20 mix-blend-lighten pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-accent/10 blur-[150px] pointer-events-none z-0" />

      <main className="z-10 w-full max-w-5xl flex flex-col items-center text-center space-y-8 animate-slide-up">
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full glass-panel text-sm text-accent mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="tracking-wide uppercase text-xs font-semibold">Live System Active</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 pb-2">
          CrowdPilot AI
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl font-light">
          Predictive crowd intelligence. Navigating 50,000 fans seamlessly with real-time routing, queue optimization, and smart analytics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full sm:w-auto">
          <Link href="/fan" className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-black transition-all duration-200 bg-white border border-transparent rounded-full hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
            Fan Experience
          </Link>
          <Link href="/dashboard" className="glass-panel group relative inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-white transition-all duration-200 rounded-full hover:bg-card-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-800">
            Admin Dashboard
          </Link>
        </div>

      </main>

      {/* Decorative Grid or Elements could go here later */}
    </div>
  );
}
