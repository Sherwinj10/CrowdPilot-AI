import json
import os

DB_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'stadiums.json')

def load_db():
    if not os.path.exists(DB_FILE):
        return {"stadiums": []}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_db(data):
    # Ensure the directory exists
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)
