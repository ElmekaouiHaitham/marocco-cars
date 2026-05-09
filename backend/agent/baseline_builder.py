import requests
from bs4 import BeautifulSoup
import re
import json
import os
import statistics
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import SEARCH_CONFIG
from storage import store

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}

def build_url(model, city):
    city_slug = city.lower().replace("é", "e").replace("è", "e")
    model_slug = model.lower().replace(" ", "_")
    return f"https://www.avito.ma/fr/{city_slug}/voitures-%C3%A0-vendre/{model_slug}"

def extract_price(text):
    # Remove \u202f, \u00a0, spaces
    clean_text = text.replace('\u202f', '').replace('\xa0', '').replace(' ', '')
    match = re.search(r"(\d+)(?:DH|MAD|Dhs)", clean_text, re.IGNORECASE)
    if match:
        val = int(match.group(1))
        if val > 10000: # Ignore monthly payment parts like "300 DH / mois"
            return val
    return None

def extract_year(features):
    for f in features:
        if re.match(r"^(20[12]\d)$", f):
            return int(f)
    return None

def extract_mileage(features):
    for f in features:
        if "km" in f.lower():
            # e.g. "115,000 km" or "100 000 km"
            clean_text = f.lower().replace("km", "").replace(",", "").replace('\u202f', '').replace('\xa0', '').replace(' ', '')
            if clean_text.isdigit():
                return int(clean_text)
    return None

def build_baseline():
    print("\n[baseline] Starting pre-computation download via requests...")
    
    all_prices = []
    all_mileages = []
    by_year = {}
    
    for city in SEARCH_CONFIG["cities"]:
        url = build_url(SEARCH_CONFIG["model"], city)
        print(f"  Fetching {city}: {url}")
        
        try:
            response = requests.get(url, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                print(f"    Failed with status code {response.status_code}")
                continue
                
            soup = BeautifulSoup(response.content, 'html.parser')
            cards = soup.select("a.sc-1jge648-0")
            
            for card in cards:
                card_text = card.text.lower()
                if "location" in card_text and "occasion" not in card_text:
                    continue # Skip rental cars
                    
                spans_text = " ".join([s.text for s in card.select("span")])
                price = extract_price(spans_text)
                
                features = [s.text.strip() for s in card.select("span") if s.text.strip()]
                year = extract_year(features)
                mileage = extract_mileage(features)
                
                if price and year and mileage and year >= SEARCH_CONFIG["min_year"]:
                    all_prices.append(price)
                    all_mileages.append(mileage)
                    
                    if str(year) not in by_year:
                        by_year[str(year)] = {"prices": [], "mileages": []}
                    by_year[str(year)]["prices"].append(price)
                    by_year[str(year)]["mileages"].append(mileage)
        except Exception as e:
            print(f"    Error fetching {city}: {e}")
            
    if not all_prices:
        print("[baseline] No valid data found to compute baseline. Using fallback defaults.")
        # Create a fallback baseline so the agent doesn't crash
        baseline = {
            "model": SEARCH_CONFIG["model"],
            "total_scraped": 0,
            "valid_for_baseline": 0,
            "average_price_mad": 80000,
            "median_price_mad": 80000,
            "price_std_dev": 10000,
            "price_25th_percentile": 70000,
            "price_75th_percentile": 90000,
            "average_mileage_km": 50000,
            "median_mileage_km": 50000,
            "by_year": {},
            "expected_price_per_year": -5000,
            "expected_price_per_10k_km": -2000
        }
        store.save("baseline.json", baseline)
        return baseline
        
    # Remove outliers
    med_price = statistics.median(all_prices)
    valid_prices = [p for p in all_prices if 0.33 * med_price < p < 3 * med_price]
    if not valid_prices: valid_prices = all_prices
    
    # Process by_year
    final_by_year = {}
    for y, data in by_year.items():
        if len(data["prices"]) > 0:
            final_by_year[y] = {
                "avg_price": round(statistics.mean(data["prices"])),
                "avg_mileage": round(statistics.mean(data["mileages"])),
                "count": len(data["prices"])
            }
            
    years_sorted = sorted(int(y) for y in final_by_year.keys())
    if len(years_sorted) >= 2:
        price_per_year = (final_by_year[str(years_sorted[-1])]["avg_price"] - final_by_year[str(years_sorted[0])]["avg_price"]) / max(years_sorted[-1] - years_sorted[0], 1)
    else:
        price_per_year = -5000

    baseline = {
        "model": SEARCH_CONFIG["model"],
        "total_scraped": len(all_prices),
        "valid_for_baseline": len(valid_prices),
        "average_price_mad": round(statistics.mean(valid_prices)),
        "median_price_mad": round(statistics.median(valid_prices)),
        "price_std_dev": round(statistics.stdev(valid_prices)) if len(valid_prices) > 1 else 0,
        "price_25th_percentile": round(sorted(valid_prices)[len(valid_prices)//4]),
        "price_75th_percentile": round(sorted(valid_prices)[3*len(valid_prices)//4]),
        "average_mileage_km": round(statistics.mean(all_mileages)),
        "median_mileage_km": round(statistics.median(all_mileages)),
        "by_year": final_by_year,
        "expected_price_per_year": round(price_per_year),
        "expected_price_per_10k_km": -1800
    }
    
    store.save("baseline.json", baseline)
    print(f"[baseline] Saved baseline. Median price: {baseline['median_price_mad']} MAD based on {baseline['valid_for_baseline']} listings.")
    return baseline

if __name__ == "__main__":
    build_baseline()
