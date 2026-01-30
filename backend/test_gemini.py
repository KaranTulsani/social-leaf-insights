import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"Gemini API Key found: {bool(api_key)}")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

try:
    print("Listing models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            
    print("\nTesting generation with gemini-pro...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello!")
    print(f"Response: {response.text}")
    print("Gemini Test: SUCCESS")
    
except Exception as e:
    print(f"Gemini Test FAILED: {e}")
