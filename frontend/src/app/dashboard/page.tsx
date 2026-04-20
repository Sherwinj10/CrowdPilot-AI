"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [crowdMultiplier, setCrowdMultiplier] = useState(1.0);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  const [stadiums, setStadiums] = useState<any[]>([]);
  const [selectedStadiumId, setSelectedStadiumId] = useState<string>("");

  // Add Venue States
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [newVenue, setNewVenue] = useState({ name: "", location: "", total_seats: 40000 });
  const [infraList, setInfraList] = useState([{ name: "", type: "gate", nearby_blocks: "" }]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin123") setIsLoggedIn(true);
    else alert("Incorrect passcode. Hint: admin123");
  };

  const fetchStadiums = () => {
    fetch(`${API_URL}/api/stadiums`)
      .then(res => res.json())
      .then(data => {
        setStadiums(data);
        if (data.length > 0 && !selectedStadiumId) setSelectedStadiumId(data[0].id);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (isLoggedIn) fetchStadiums();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !selectedStadiumId || showAddVenue) return;
    
    // We poll faster to show live SOS alerts
    const fetchLiveData = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/live?stadium_id=${selectedStadiumId}&crowd_multiplier=${crowdMultiplier}`);
        if (!res.ok) throw new Error("API Error");
        const data = await res.json();
        
        if (data.metrics) setDashboardData(data);
      } catch (err) {
        console.error("Backend connection failed.", err);
      }
    };
    
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 3000); // Live poll every 3s
    return () => clearInterval(interval);
  }, [crowdMultiplier, isLoggedIn, selectedStadiumId, showAddVenue]);

  // SOS Handle
  const clearSOS = async () => {
    try {
        await fetch(`${API_URL}/api/sos/clear`, { method: "POST" });
        alert("Emergency Teams Dispatched. System Clear.");
    } catch(err) {
        console.log(err);
    }
  }

  // Infra setup
  const handleAddInfra = () => setInfraList([...infraList, { name: "", type: "gate", nearby_blocks: "" }]);
  const handleInfraChange = (index: number, field: string, value: string) => {
    const updated = [...infraList];
    updated[index] = { ...updated[index], [field]: value };
    setInfraList(updated);
  };

  const submitNewVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
        name: newVenue.name,
        location: newVenue.location,
        total_seats: parseInt(newVenue.total_seats.toString()),
        infrastructure: infraList.map(inf => ({
            name: inf.name,
            type: inf.type,
            nearby_blocks: inf.nearby_blocks.split(",").map(b => b.trim().toUpperCase()).filter(b => b)
        }))
    };

    try {
        const res = await fetch(`${API_URL}/api/stadiums`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            alert("Success! Venue integrated into Live DB.");
            setShowAddVenue(false);
            fetchStadiums();
        }
    } catch(err) {
        alert("Failed to create venue.");
    }
  };

  if (!isLoggedIn) {
     // Login Render
    return (
      <div className="min-h-screen flex items-center justify-center relative p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black pointer-events-none" />
        <form onSubmit={handleLogin} className="glass-panel p-8 w-full max-w-sm z-10 animate-slide-up flex flex-col space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Admin Auth</h2>
            <p className="text-neutral-400 text-sm">Authorized personnel only.</p>
          </div>
          <input type="password" placeholder="Passcode (admin123)" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-accent" required />
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-bold transition-colors">Access Command Center</button>
          <Link href="/" className="text-center text-xs text-neutral-500 hover:text-white transition-colors">Return Home</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 animate-fade-in relative flex flex-col overflow-hidden">
      
      {/* Tech Operations Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />

      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none z-0" />

      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Command Center</h1>
          
          {!showAddVenue && (
          <div className="flex items-center space-x-3 animate-fade-in">
             <span className="text-neutral-400 text-sm">Monitoring Venue:</span>
             <select 
                value={selectedStadiumId} 
                onChange={(e) => setSelectedStadiumId(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded px-3 py-1 focus:ring-accent focus:border-accent"
             >
                {stadiums.map(s => (
                   <option key={s.id} value={s.id}>{s.name} ({s.location})</option>
                ))}
             </select>
          </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowAddVenue(!showAddVenue)} className="px-4 py-2 rounded bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors">
            {showAddVenue ? "← Back to Live Dashboard" : "+ Add New Venue"}
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="px-4 py-2 rounded-full glass-panel text-sm hover:bg-card-hover transition-colors">Logout</button>
        </div>
      </header>

      {/* ADMIN ADD VENUE FLOW */}
      {showAddVenue ? (
        <div className="relative z-10 animate-slide-up w-full max-w-4xl mx-auto">
            {/* Same Add Venue Form */}
            <form onSubmit={submitNewVenue} className="glass-panel p-8 space-y-8">
                <div>
                   <h2 className="text-2xl font-bold text-white">Setup New Stadium</h2>
                   <p className="text-neutral-400 text-sm">Dynamically generate a new database entity.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Stadium Name</label>
                        <input type="text" value={newVenue.name} onChange={e => setNewVenue({...newVenue, name: e.target.value})} placeholder="e.g. Chinnaswamy" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-accent outline-none" required />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">City/Location</label>
                        <input type="text" value={newVenue.location} onChange={e => setNewVenue({...newVenue, location: e.target.value})} placeholder="e.g. Bangalore, IND" className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-accent outline-none" required />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-neutral-400 mb-1">Total Capacity</label>
                        <input type="number" value={newVenue.total_seats} onChange={e => setNewVenue({...newVenue, total_seats: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white focus:border-accent outline-none" required />
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg text-white font-semibold">Infrastructure Mapping</h3>
                        <button type="button" onClick={handleAddInfra} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors">+ Add Component</button>
                    </div>
                    
                    <div className="space-y-4">
                        {infraList.map((infra, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black/40 p-4 rounded-lg border border-white/5">
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] uppercase text-neutral-500 mb-1">Name</label>
                                    <input type="text" value={infra.name} onChange={e => handleInfraChange(idx, "name", e.target.value)} placeholder="e.g. Gate 3" className="w-full bg-transparent border-b border-white/20 p-1 text-white text-sm focus:border-accent outline-none" required />
                                </div>
                                <div className="w-full sm:w-32">
                                    <label className="block text-[10px] uppercase text-neutral-500 mb-1">Type</label>
                                    <select value={infra.type} onChange={e => handleInfraChange(idx, "type", e.target.value)} className="w-full bg-transparent border-b border-white/20 p-1 text-white text-sm focus:border-accent outline-none">
                                        <option value="gate" className="bg-neutral-900">Gate</option>
                                        <option value="food" className="bg-neutral-900">Food Stall</option>
                                        <option value="washroom" className="bg-neutral-900">Washroom</option>
                                    </select>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] uppercase text-neutral-500 mb-1">Nearby Blocks (Comma separated)</label>
                                    <input type="text" value={infra.nearby_blocks} onChange={e => handleInfraChange(idx, "nearby_blocks", e.target.value)} placeholder="e.g. A, B, C" className="w-full bg-transparent border-b border-white/20 p-1 text-white text-sm focus:border-accent outline-none" required />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">Deploy to Database</button>
                </div>
            </form>
        </div>
      ) : !dashboardData ? (
         <div className="flex-1 flex items-center justify-center text-white font-medium">Connecting to AI Engine or waiting for venue...</div>
      ) : (
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 animate-fade-in">
        
        {/* AI FEATURE 3: SOS BANNER RENDER */}
        {dashboardData.sos_alerts?.length > 0 && (
          <div className="lg:col-span-4 bg-red-600 border border-red-400 p-6 rounded-[1rem] shadow-[0_0_40px_rgba(220,38,38,0.6)] animate-pulse flex flex-col md:flex-row justify-between items-center gap-6">
             <div>
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                    <span>⚠️</span> EMERGENCY REPORTED
                </h2>
                {dashboardData.sos_alerts.map((alert: any, idx: number) => (
                    <p key={idx} className="text-white text-lg font-medium">
                       Time: {alert.time} — Location: <span className="font-bold underline text-yellow-300">{alert.location}</span>
                    </p>
                ))}
             </div>
             <button onClick={clearSOS} className="w-full md:w-auto bg-white text-red-600 font-bold px-8 py-4 rounded-full hover:bg-neutral-200 transition-colors shadow-lg whitespace-nowrap">
                Acknowledge & Dispatch Team
             </button>
          </div>
        )}

        {/* Hackathon Simulation Controller */}
        <div className="lg:col-span-4 glass-panel p-5 bg-accent/10 border-accent/20 flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <h3 className="text-white font-bold">Simulator Controls</h3>
            <p className="text-xs text-neutral-300">Drag to simulate live crowd rush</p>
          </div>
          <input type="range" min="0.5" max="1.6" step="0.1" value={crowdMultiplier} onChange={(e) => setCrowdMultiplier(parseFloat(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer" />
          <div className="flex-shrink-0 text-accent font-bold">{Math.round(crowdMultiplier * 100)}% Load</div>
        </div>

        {/* Metrics */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5">
            <p className="text-neutral-400 text-sm mb-1">Total Attendance</p>
            <p className="text-3xl font-bold text-white">{dashboardData.metrics.total_attendance.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 mt-1">out of {dashboardData.metrics.max_capacity.toLocaleString()}</p>
          </div>
          <div className={`glass-panel p-5 ${dashboardData.metrics.active_alerts > 0 ? "border-red-500/50" : ""}`}>
            <p className="text-neutral-400 text-sm mb-1">Active AI Alerts</p>
            <p className={`text-3xl font-bold ${dashboardData.metrics.active_alerts > 0 ? "text-red-400" : "text-green-400"}`}>{dashboardData.metrics.active_alerts}</p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-neutral-400 text-sm mb-1">Overall Risk Level</p>
            <p className={`text-3xl font-bold ${dashboardData.metrics.overall_congestion === "High" ? "text-red-400" : (dashboardData.metrics.overall_congestion === "Medium" ? "text-orange-400" : "text-green-400")}`}>{dashboardData.metrics.overall_congestion}</p>
          </div>
          <div className="glass-panel p-5">
            <p className="text-neutral-400 text-sm mb-1">Avg Wait / Zone</p>
            <p className="text-3xl font-bold text-white">{dashboardData.metrics.avg_wait_time} m</p>
          </div>
        </div>

        {/* AI Predictors & Zones */}
        <section className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 border-accent/20 border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-white">Zone Congestion Dynamics</h3>
            </div>
            
            <div className="space-y-6">
              {Object.entries(dashboardData.zones).map(([zone, load]: [string, any]) => (
                <div key={zone}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">{zone}</span>
                    <span className={`font-medium ${load > 80 ? 'text-red-400' : (load > 50 ? 'text-orange-400' : 'text-green-400')}`}>{load}% Capacity</span>
                  </div>
                  <div className="w-full bg-neutral-900 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${load > 80 ? 'bg-red-500' : (load > 50 ? 'bg-orange-500' : 'bg-green-500')}`} style={{ width: `${load}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            {dashboardData.predictions.map((pred: any, idx: number) => (
              <div key={idx} className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start space-x-3 animate-slide-up">
                <div className="text-xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="text-orange-400 font-bold text-sm tracking-wider uppercase">Congestion Alert</h4>
                  <p className="text-neutral-300 text-sm mt-1">{pred.message}</p>
                </div>
                <button className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg">
                  {pred.action}
                </button>
              </div>
            ))}

          </div>
        </section>

      </main>
      )}
    </div>
  );
}
