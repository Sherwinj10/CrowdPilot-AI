"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FanExperience() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  const [ticketState, setTicketState] = useState("input");
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [formData, setFormData] = useState({ stadiumId: "", block: "A", row: "12", seat: "18", is_vip: false });
  const [routeInfo, setRouteInfo] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/stadiums`)
      .then(res => res.json())
      .then(data => {
        setStadiums(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, stadiumId: data[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleFetchRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stadiumId) return alert("Please select a stadium.");
    
    setTicketState("loading");
    
    try {
      const res = await fetch(`${API_URL}/route?stadium_id=${formData.stadiumId}&block=${formData.block}&row=${formData.row}&seat=${formData.seat}&is_vip=${formData.is_vip}`);
      const data = await res.json();
      setRouteInfo(data);
      setTicketState("dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to connect to AI server.");
      setTicketState("input");
    }
  };

  const triggerSOS = async () => {
       try {
           await fetch(`${API_URL}/api/sos`, {
               method: "POST", 
               headers: {"Content-Type":"application/json"},
               body: JSON.stringify({
                   stadium_id: formData.stadiumId,
                   block: formData.block, 
                   row: formData.row, 
                   seat: formData.seat
               })
           });
           alert("🆘 SOS Sent. Security is en route to your exact block and seat location.");
       } catch (err) {
           alert("SOS System unavailable.");
       }
   };

  return (
    <div className="min-h-screen p-6 md:p-12 relative flex flex-col items-center overflow-hidden">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 opacity-[0.04] mix-blend-lighten pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0A0A0A]/50 to-[#0A0A0A] pointer-events-none" />

      <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${formData.is_vip ? 'bg-yellow-500/10' : 'bg-blue-500/10'} rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 z-0`} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {ticketState === "input" && (
        <form onSubmit={handleFetchRoute} className="glass-panel p-8 w-full max-w-md mt-16 animate-fade-in flex flex-col space-y-6 z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">My Ticket</h2>
            <p className="text-neutral-400 text-sm">Select your venue to securely route your entry.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wider">Venue / Stadium</label>
              <select 
                value={formData.stadiumId} 
                onChange={(e) => setFormData({...formData, stadiumId: e.target.value})} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none"
                required
              >
                {stadiums.length === 0 && <option value="">Loading venues...</option>}
                {stadiums.map(s => (
                  <option key={s.id} value={s.id} className="text-black bg-white">{s.name} ({s.location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wider">Block / Section</label>
              <input type="text" placeholder="e.g. A" value={formData.block} onChange={(e) => setFormData({...formData, block: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wider">Row</label>
                <input type="text" value={formData.row} onChange={(e) => setFormData({...formData, row: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1 uppercase tracking-wider">Seat</label>
                <input type="text" value={formData.seat} onChange={(e) => setFormData({...formData, seat: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent transition-all" required />
              </div>
            </div>

            {/* AI FEATURE 2: VIP CHECKBOX */}
            <div className="pt-2">
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors">
                    <input type="checkbox" checked={formData.is_vip} onChange={e => setFormData({...formData, is_vip: e.target.checked})} className="w-5 h-5 accent-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-500 tracking-wider uppercase">Premium / VIP Ticket</span>
                </label>
            </div>
          </div>
          
          <button type="submit" className={`w-full ${formData.is_vip ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-white hover:bg-neutral-200'} text-black py-3 rounded-lg font-bold transition-colors`}>
            Generate Route
          </button>
          
          <Link href="/" className="text-center text-xs text-neutral-500 hover:text-white transition-colors">Cancel</Link>
        </form>
      )}

      {ticketState === "loading" && (
        <div className="mt-40 flex flex-col items-center space-y-6 animate-fade-in z-10">
          <div className={`w-16 h-16 border-4 border-white/10 ${formData.is_vip ? 'border-t-yellow-500' : 'border-t-accent'} rounded-full animate-spin`}></div>
          <p className="text-neutral-400 font-medium">Cross-referencing venue infrastructure...</p>
        </div>
      )}

      {ticketState === "dashboard" && routeInfo && (
        <div className="w-full max-w-5xl animate-fade-in z-10 relative">
          
          <header className="flex justify-between items-center mb-8 flex-wrap gap-4 relative">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{routeInfo.stadium_name}</h1>
              <p className={`${routeInfo.is_vip ? 'text-yellow-500' : 'text-accent'} text-sm font-semibold uppercase tracking-widest`}>
                  {routeInfo.is_vip ? '★ VIP ACCESS' : 'GENERAL ACCESS'} • {routeInfo.seat_info}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
                {/* AI FEATURE 3: SOS EMERGENCY BUTTON */}
                <button onClick={triggerSOS} className="hidden sm:inline-flex animate-pulse bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all">
                    🆘 EMERGENCY SOS
                </button>
                <button onClick={() => setTicketState("input")} className="px-4 py-2 rounded-full glass-panel text-sm hover:bg-card-hover transition-colors">
                  Reset
                </button>
            </div>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* AI FEATURE 1: GAMIFIED REDIRECTION HERO BANNER */}
            {routeInfo.discount_offer && (
                <div className="md:col-span-3 bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center animate-slide-up shadow-lg">
                    <div className="mb-4 md:mb-0">
                       <h3 className="text-orange-400 font-bold text-sm lg:text-base uppercase tracking-wider mb-2">🎁 Exclusive Offer: Load Alleviation</h3>
                       <p className="text-white text-base lg:text-lg">{routeInfo.discount_offer.message}</p>
                    </div>
                    <button className="w-full md:w-auto whitespace-nowrap bg-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-600 transition-all text-sm">
                        Accept Route ({routeInfo.discount_offer.new_wait} mins)
                    </button>
                </div>
            )}

            <section className="md:col-span-2 space-y-6">
              
              <div className={`glass-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border ${routeInfo.is_vip ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-accent/20'}`}>
                <div>
                  <p className={`${routeInfo.is_vip ? 'text-yellow-500' : 'text-accent'} text-sm font-semibold uppercase tracking-wider mb-1`}>Assigned Entry</p>
                  <h2 className="text-2xl sm:text-4xl font-bold text-white">{routeInfo.fastest_gate}</h2>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <p className={`text-3xl font-light ${routeInfo.is_vip ? 'text-yellow-400' : 'text-neutral-200'}`}>{routeInfo.wait_mins} mins</p>
                  <p className="text-neutral-500 text-sm">Estimated Wait</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="glass-panel p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Smart Route</h3>
                  <div className="space-y-4">
                    {routeInfo.route_steps.map((step: string, i: number) => (
                      <div key={i}>
                        <div className="flex items-center space-x-3 text-neutral-300">
                          <div className={`w-2 h-2 rounded-full ${i === routeInfo.route_steps.length - 1 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : (routeInfo.is_vip ? 'bg-yellow-500' : 'bg-accent')}`}></div>
                          <p className={`text-sm ${i === routeInfo.route_steps.length - 1 ? "text-white font-semibold" : ""}`}>{step}</p>
                        </div>
                        {i < routeInfo.route_steps.length - 1 && <div className="w-0.5 h-4 bg-neutral-800 ml-1"></div>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Relevant Queues</h3>
                  {routeInfo.queues.length === 0 ? (
                    <p className="text-sm text-neutral-500">No specific infrastructure mapped to your block yet.</p>
                  ) : (
                    <ul className="space-y-4">
                      {routeInfo.queues.map((q: any, i: number) => (
                        <li key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-neutral-300 text-sm">{q.name}</span>
                          <span className={`${q.wait_mins > 10 ? 'text-red-400 bg-red-400/10' : 'text-green-400 bg-green-400/10'} font-medium px-2 py-1 rounded text-xs`}>
                            {q.wait_mins} mins
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              
              {/* Mobile SOS Block */}
              <div className="glass-panel p-6 sm:hidden bg-red-500/10 border-red-500/30">
                 <h3 className="text-red-400 font-bold mb-3">Emergency Response</h3>
                 <button onClick={triggerSOS} className="w-full bg-red-600 text-white font-bold py-3 rounded-lg animate-pulse">Trigger SOS Mode</button>
              </div>

              <div className="glass-panel p-6 bg-green-500/5 border-green-500/20">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h3 className="text-green-400 font-semibold uppercase tracking-wider text-sm">System Ready</h3>
                </div>
                <p className="text-neutral-200 text-sm">You are viewing custom-tailored data for {routeInfo.stadium_name}. Have a great time!</p>
              </div>
            </aside>
          </main>
        </div>
      )}
    </div>
  );
}
