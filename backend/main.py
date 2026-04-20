from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import uuid
import random

from database import load_db, save_db

app = FastAPI(
    title="CrowdPilot AI API",
    description="Product-Ready Smart Stadium Intelligence"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InfrastructureModel(BaseModel):
    id: Optional[str] = None
    name: str
    type: str # 'gate', 'food', 'washroom'
    nearby_blocks: List[str]

class StadiumModel(BaseModel):
    id: Optional[str] = None
    name: str
    location: str
    total_seats: int
    infrastructure: List[InfrastructureModel] = []

class SOSModel(BaseModel):
    stadium_id: str
    block: str
    row: str
    seat: str

# In-memory store for rapid SOS alerts (production would use Redis/DB)
sos_alerts_db = []

# --- STADIUM MANAGEMENT (ADMIN CRUD) ---

@app.get("/api/stadiums")
def get_stadiums():
    db = load_db()
    return db["stadiums"]

@app.post("/api/stadiums")
def create_stadium(stadium: StadiumModel):
    db = load_db()
    stadium.id = f"std_{uuid.uuid4().hex[:8]}"
    for infra in stadium.infrastructure:
        if not infra.id:
            infra.id = f"{infra.type}_{uuid.uuid4().hex[:6]}"
            
    db["stadiums"].append(stadium.model_dump())
    save_db(db)
    return {"status": "success", "stadium": stadium}

# --- SOS EMERGENCY ENDPOINTS ---

@app.post("/api/sos")
def trigger_sos(sos: SOSModel):
    alert = {
        "id": str(uuid.uuid4()),
        "time": time.strftime("%H:%M:%S"),
        "location": f"Block {sos.block.upper()}, Row {sos.row}, Seat {sos.seat}"
    }
    sos_alerts_db.append(alert)
    return {"status": "success", "alert": alert}

@app.post("/api/sos/clear")
def clear_sos():
    sos_alerts_db.clear()
    return {"status": "cleared"}

# --- FAN APIs ---

@app.get("/route")
def get_user_route(stadium_id: str = Query(...), block: str = Query(...), row: str = Query(...) , seat: str = Query(...), is_vip: bool = False):
    db = load_db()
    stadium = next((s for s in db["stadiums"] if s["id"] == stadium_id), None)
    
    if not stadium:
        raise HTTPException(status_code=404, detail="Stadium not found")
        
    best_gate = None
    for infra in stadium["infrastructure"]:
        if infra["type"] == "gate" and block.upper() in infra["nearby_blocks"]:
            best_gate = infra["name"]
            break
            
    if not best_gate:
        gates = [i["name"] for i in stadium["infrastructure"] if i["type"] == "gate"]
        best_gate = gates[0] if gates else "Main Gate"
        
    local_infra = [i for i in stadium["infrastructure"] if i["type"] == "food" and block.upper() in i["nearby_blocks"]]
    
    queues = []
    for item in local_infra:
        queues.append({
            "name": item["name"],
            "type": item["type"],
            "wait_mins": random.randint(2, 5) if is_vip else random.randint(5, 15)
        })

    # === AI FEATURE 2: VIP FAST ROUTING ===
    if is_vip:
        wait_mins = 1
        route_steps = [
            f"Enter {best_gate} (VIP Fast Track Lane)",
            "Take VIP Elevator to Club Level",
            f"Proceed through Private Lounge to Block {block.upper()}",
            f"Staff Escort to Row {row}"
        ]
        discount_offer = None
    else:
        # Standard routing
        wait_mins = random.randint(12, 28) # Simulate congestion
        route_steps = [
            f"Enter {best_gate}",
            f"Scan Ticket at General Security",
            f"Proceed to Public Concourse Block {block.upper()}",
            f"Locate Row {row}"
        ]
        
        # === AI FEATURE 1: GAMIFIED LOAD BALANCING ===
        # If wait time is too high, offer an incentive to reroute
        discount_offer = None
        if wait_mins > 15:
            # Find an alternative gate
            alt_gates = [i["name"] for i in stadium["infrastructure"] if i["type"] == "gate" and i["name"] != best_gate]
            alt = alt_gates[0] if alt_gates else "Secondary Entrance"
            
            discount_offer = {
                "message": f"Heavy traffic ahead. Reroute via {alt} and get a 20% discount coupon for food stalls!",
                "new_gate": alt,
                "new_wait": random.randint(2, 7)
            }

    return {
        "stadium_name": stadium["name"],
        "seat_info": f"Block {block.upper()}, Row {row}, Seat {seat}",
        "fastest_gate": best_gate,
        "wait_mins": wait_mins,
        "route_steps": route_steps,
        "queues": queues,
        "is_vip": is_vip,
        "discount_offer": discount_offer
    }

# --- ADMIN APIs ---

@app.get("/dashboard/live")
def get_dashboard_live(stadium_id: str = Query(...), crowd_multiplier: float = 1.0):
    db = load_db()
    stadium = next((s for s in db["stadiums"] if s["id"] == stadium_id), None)
    if not stadium:
        stadium = {"name": "Default", "total_seats": 50000, "infrastructure": []}
        
    max_capacity = stadium.get("total_seats", 50000)
    attendance = int((max_capacity * 0.6) * crowd_multiplier)
    
    gates = [i for i in stadium.get("infrastructure", []) if i["type"] == "gate"]
    if not gates:
        gates = [{"name": "Main Entrance"}, {"name": "Secondary Gate"}]
        
    zones = {}
    predictions = []
    
    for idx, gate in enumerate(gates):
        base_load = 40 + (idx * 20) 
        if base_load > 80: base_load = 50 + idx * 5
        
        current_load = min(100, int(base_load * crowd_multiplier))
        zones[f"{gate['name']}"] = current_load
        
        if current_load > 85:
            predictions.append({
                "zone": gate["name"], 
                "message": f"CRITICAL: Jam detected.", 
                "action": "Broadcast 20% Discount Incentive to Divert."
            })
    
    max_load = max(zones.values()) if zones else 0
    overall_congestion = "High" if max_load > 80 else ("Medium" if max_load > 50 else "Low")

    return {
        "metrics": {
            "total_attendance": attendance,
            "max_capacity": max_capacity,
            "active_alerts": len(predictions),
            "overall_congestion": overall_congestion,
            "avg_wait_time": round(3.2 * crowd_multiplier, 1)
        },
        "zones": zones,
        "predictions": predictions,
        "sos_alerts": sos_alerts_db # === AI FEATURE 3: SOS SYSTEM ===
    }

# --- MONOLITHIC NEXT.JS STATIC SERVING ---
import os
from fastapi.responses import FileResponse

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "out")
if os.path.exists(frontend_path):
    @app.get("/")
    def read_root():
        return FileResponse(os.path.join(frontend_path, "index.html"))
        
    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_path, full_path)
        html_path = os.path.join(frontend_path, f"{full_path}.html")
        
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        elif os.path.isfile(html_path):
            return FileResponse(html_path)
            
        return FileResponse(os.path.join(frontend_path, "index.html"))
