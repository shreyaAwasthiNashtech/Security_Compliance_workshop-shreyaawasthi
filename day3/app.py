from flask import Flask, request, jsonify
import os

app = Flask(__name__)

API_KEY = "supersecret123"

@app.route('/')
def home():
    return "Day 3: Secure Coding Demo"

@app.route('/config')
def config():
    
    return jsonify({"api_key": API_KEY})

@app.route('/calc')
def calc():
    """
    WARNING: intentionally insecure use of eval() for demo.
    Do NOT run untrusted expressions in production.
    Example: /calc?expr=2+2
    """
    expr = request.args.get('expr', '')
    try:
        # INSECURE: eval on user input - for training purposes only
        result = eval(expr)
        return jsonify({"expr": expr, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
