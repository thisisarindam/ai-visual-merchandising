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
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@app.route('/api/audit-display', methods=['POST'])
def audit_display():
    try:
        if 'store_image' not in request.files:
            return jsonify({"error": "'store_image' is required."}), 400
        
        store_file = request.files['store_image']
        
        if store_file.filename == '':
            return jsonify({"error": "Missing selected file."}), 400

        store_image = Image.open(io.BytesIO(store_file.read()))

        # Load the pre-approved Head Office guideline images from the server
        ho_image_paths = ["ho_guideline_1.jpg", "ho_guideline_2.jpg"]
        ho_images = []
        for path in ho_image_paths:
            if not os.path.exists(path):
                return jsonify({"error": f"Predefined head office image '{path}' not found on server."}), 500
            ho_images.append(Image.open(path))

        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = """
        You are a STRICT VISUAL MERCHANDISER whose sole responsibility is to showcase each fashion item to the customer properly and neatly.
        Compare the uploaded Store Execution Photo (the last image provided) against the predefined Head Office approved photos provided before it.
        
        Check the following parameters:
        1. Correct color-wise arrangement of garments.
        2. Overall clothing/garments arrangement.
        3. Whether garments or fashion items are showcased properly and neatly.
        
        Based on your strict evaluation, provide a report containing:
        - A Score from 1 to 100 (the higher the score, the better the arrangement).
        - Detailed feedback on what is correct and what fails the parameters above.
        - Specific instructions if any other arrangement or improvement is needed.
        """
        
        # Combine the prompt, all HO images, and the store image into a single list
        payload = [prompt] + ho_images + [store_image]
        response = model.generate_content(payload)
        
        return jsonify({"ai_report": response.text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)