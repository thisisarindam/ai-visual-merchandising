import os
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from PIL import Image

app = Flask(__name__)
# Enable CORS to allow the GitHub Pages frontend to communicate with this backend
CORS(app)

# Configure Gemini API
api_key = os.environ.get("GEMINI_API_KEY", "AIzaSyDj8zjJ9TkrYW6qEzJELUlperBPDiwAkiM")
if api_key:
    genai.configure(api_key=api_key)

@app.route('/api/audit-display', methods=['POST'])
def audit_display():
    try:
        if 'ho_image' not in request.files or 'store_image' not in request.files:
            return jsonify({"error": "Both 'ho_image' and 'store_image' are required."}), 400
        
        ho_file = request.files['ho_image']
        store_file = request.files['store_image']
        
        if ho_file.filename == '' or store_file.filename == '':
            return jsonify({"error": "Missing selected file(s)."}), 400

        ho_image = Image.open(io.BytesIO(ho_file.read()))
        store_image = Image.open(io.BytesIO(store_file.read()))

        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = """
        You are a strict Visual Merchandising Auditor for CITISTYLE.
        Please compare Image 2 (store execution) against Image 1 (Head Office guideline).
        Based on your strict evaluation, provide a report containing exactly the following details:
        - Match Score (as a percentage)
        - Status (e.g., Pass, Needs Improvement, Fail)
        - A bulleted list of Errors (noting missing items, wrong placements, lighting issues, etc.)
        """
        response = model.generate_content([prompt, ho_image, store_image])
        return jsonify({"ai_report": response.text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)