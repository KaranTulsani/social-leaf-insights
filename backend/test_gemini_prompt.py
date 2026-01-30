import google.generativeai as genai
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.0-flash')

script = "This is the new iPhone 16. It has a better camera and a faster processor. The battery life is also improved. I think it's a good phone for people who like Apple products."

prompt = f"""
You are a viral content expert. Analyze this script and generate two versions of the hook (the opening line):
1. "Average Hook": A typical, boring opening that most people use.
2. "High-Retention Hook": A viral, curiosity-inducing, or emotionally charged opening that grabs attention immediately.

Script:
"{script}"

Return ONLY a JSON object with keys: "average_hook", "high_retention_hook".
Do not include Markdown formatting like ```json ... ```. Just the raw JSON string.
"""

print("Sending prompt to Gemini...")
try:
    response = model.generate_content(prompt)
    print("\n--- Raw Response Text ---")
    print(response.text)
    print("-------------------------")
    
    text = response.text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
        
    data = json.loads(text)
    print("\nParsed JSON:")
    print(json.dumps(data, indent=2))
    print("\nSUCCESS")
except Exception as e:
    print(f"\nFAILED: {e}")
