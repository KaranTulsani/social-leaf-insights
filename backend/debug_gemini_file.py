import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback
import sys

# Redirect output to file
sys.stdout = open('debug_output.txt', 'w')
sys.stderr = sys.stdout

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")

genai.configure(api_key=api_key)

try:
    print("Attempting to list models...")
    for m in genai.list_models():
        print(f"Found model: {m.name}")
        
    print("\nAttempting generation with 'gemini-1.5-flash'...")
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Test")
    print(f"Success! Response: {response.text}")
    
except Exception:
    print("\nERROR OCCURRED:")
    traceback.print_exc()
