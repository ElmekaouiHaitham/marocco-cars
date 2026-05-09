import json
import google.generativeai as genai

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from storage import store
from config import SEARCH_CONFIG, GEMINI_API_KEY, GEMINI_FLASH

genai.configure(api_key=GEMINI_API_KEY)
flash = genai.GenerativeModel(GEMINI_FLASH)

def generate_negotiation_tip(listing, baseline):
    prompt = f"""
You are a car buying negotiator in Morocco.
Write ONE short negotiation tip (max 2 sentences) for this listing.
Be specific with numbers. Respond in English.

Car: {listing['year']} {SEARCH_CONFIG['model']} — {listing.get('fuel_type')}
Listed price: {listing['price_mad']} MAD
Fair price: {listing['fair_price_mad']} MAD
Price vs market: {listing['price_vs_market_pct']*100:.1f}%
Mileage: {listing.get('mileage_km')} km
Negotiable: {listing.get('negotiable')}
Flags: {[f['label'] for f in listing.get('flags', [])]}
"""
    try:
        resp = flash.generate_content(prompt)
        return resp.text.strip()
    except:
        return ""

def build_results(enriched_listings, baseline):
    # Sort by score descending
    ranked = sorted(enriched_listings, key=lambda l: l.get("score", 0), reverse=True)

    # Generate negotiation tips for top 10 only
    print("[output] Generating negotiation tips for top 10...")
    for i, listing in enumerate(ranked[:10]):
        ranked[i]["negotiation_tip"] = generate_negotiation_tip(listing, baseline)

    # Add rank
    for i, l in enumerate(ranked):
        l["rank"] = i + 1

    store.save("results.json", ranked)
    print(f"[output] Saved {len(ranked)} ranked listings to results.json")
    return ranked
