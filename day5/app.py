# app/app.py
from flask import Flask, request, jsonify

app = Flask(__name__)

import os
API_KEY = os.getenv("APP_API_KEY", "placeholder_demo_key")

@app.route("/")
def home():
    return "Day 5: Vulnerable Flask app (demo)"

@app.route("/echo")
def echo():
    msg = request.args.get("msg", "")
    return f"<html><body>Echo: {msg}</body></html>"

@app.route("/calc")
def calc():
    expr = request.args.get("expr", "")
    try:
        result = eval(expr)   
        return jsonify({"expr": expr, "result": str(result)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/secret")
def secret():
    return jsonify({"api_key": API_KEY})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
