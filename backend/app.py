from flask import Flask, jsonify
from flask_cors import CORS
import json
import os
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

script_dir = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(script_dir, "final_result.json")
MAX_AGE_SECONDS = 5  # Consider stale if older than this

def is_file_stale(filepath, max_age):
    if not os.path.exists(filepath):
        return True
    last_modified = os.path.getmtime(filepath)
    return (time.time() - last_modified) > max_age

@app.route("/api/data")
def get_data():
    try:
        if is_file_stale(DATA_FILE, MAX_AGE_SECONDS):
            print("⚠️ Data is stale or missing.")
            # Send dummy 0-filled fallback
            dummy = [
                {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "id": sid,
                    "Temperature": 0,
                    "Humidity": 0
                }
                for sid in [
                    '01', '02', '03', '04', '05', '06', '07', '08', '09', '0A',
                    '14', '0B', '0C', '0D', '0E', '15',
                    '0F', '10', '11', '12', '13', 'FIXED'
                ]
            ]
            return jsonify(dummy)

        with open(DATA_FILE, "r") as f:
            data = json.load(f)
        return jsonify(data)

    except Exception as e:
        print("❌ Error reading final_result.json:", e)
        return jsonify([]), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
