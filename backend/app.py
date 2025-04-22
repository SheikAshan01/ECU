from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

@app.route("/api/data")
def get_data():
    try:
        with open("final_result.json", "r") as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        print("❌ Error:", e)
        return jsonify([]), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
