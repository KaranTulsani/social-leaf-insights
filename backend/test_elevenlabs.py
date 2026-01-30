import httpx
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ELEVENLABS_API_KEY")
print(f"ElevenLabs API Key found: {bool(api_key)}")

if not api_key:
    print("Error: ELEVENLABS_API_KEY not found in .env")
    exit(1)

async def test_elevenlabs():
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {
        "xi-api-key": api_key
    }
    
    print("Testing ElevenLabs API (Listing Voices)...")
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        
        if response.status_code == 200:
            voices = response.json()['voices']
            print(f"Success! Found {len(voices)} voices.")
            print(f"First voice: {voices[0]['name']} ({voices[0]['voice_id']})")
            print("ElevenLabs Test: SUCCESS")
        else:
            print(f"ElevenLabs Test FAILED: {response.status_code} - {response.text}")

if __name__ == "__main__":
    asyncio.run(test_elevenlabs())
