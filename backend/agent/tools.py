from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from storage import store

class AgentTools:
    def __init__(self):
        print("[System] Initializing Chrome WebDriver...")
        options = webdriver.ChromeOptions()
        # Non-headless, so we can watch it
        options.add_argument("--window-size=1280,800")
        
        # Selenium 4.6+ handles drivers automatically
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)
        self.scraped_urls = set()

    def navigate_to(self, url: str) -> str:
        """Navigates the browser to a specific URL."""
        print(f"[Agent Action] Navigating to: {url}")
        self.driver.get(url)
        time.sleep(3) # Wait for JS to load
        return f"Successfully navigated to {url}. Current page title: {self.driver.title}"

    def scroll_page(self, direction: str = "down") -> str:
        """Scrolls the page down or up to reveal more content."""
        print(f"[Agent Action] Scrolling {direction}...")
        if direction == "down":
            self.driver.execute_script("window.scrollBy(0, 800);")
        else:
            self.driver.execute_script("window.scrollBy(0, -800);")
        time.sleep(2)
        return "Scrolled the page."

    def get_page_content(self) -> str:
        """Extracts visible text and links from the current page to help the agent decide what to click."""
        print("[Agent Action] Reading page content...")
        
        # If we are on a search page, extract cards specifically
        if "voitures" in self.driver.current_url and "?" not in self.driver.current_url.split("/")[-1]:
            cards = self.driver.find_elements(By.CSS_SELECTOR, "a.sc-1jge648-0")
            content = "Visible Car Listings:\n"
            for i, card in enumerate(cards):
                try:
                    text = card.text.replace('\n', ' | ')
                    href = card.get_attribute('href')
                    if href and "location" not in text.lower():
                        content += f"[{i}] {text} -> URL: {href}\n"
                except:
                    pass
            return content
        else:
            # If on a specific listing, extract full text
            body = self.driver.find_element(By.TAG_NAME, "body")
            return f"Full Page Text:\n{body.text[:3000]}" # Limit to first 3000 chars

    def go_back(self) -> str:
        """Navigates back to the previous page."""
        print("[Agent Action] Going back to previous page...")
        self.driver.back()
        time.sleep(3)
        return "Navigated back."

    def get_market_baseline(self) -> str:
        """Reads the pre-calculated market baseline JSON data."""
        try:
            baseline = store.load("baseline.json")
            return json.dumps(baseline, indent=2)
        except Exception as e:
            return f"Error loading baseline: {e}"

    def evaluate_and_save_listing(self, url: str, title: str, price_mad: int, year: int, mileage_km: int, score: int, verdict: str, negotiation_tip: str, flags: list) -> str:
        """Saves a fully evaluated car listing to the database so it appears on the frontend dashboard."""
        if url in self.scraped_urls:
            return "Listing already saved. Do not save duplicates."
            
        print(f"\n[Agent Saving Deal] {title} - {price_mad} MAD - Score: {score} ({verdict})")
        
        # Get baseline for % calculation
        baseline = store.load("baseline.json")
        fair_price = baseline.get("median_price_mad", price_mad)
        pct_diff = round((price_mad - fair_price) / fair_price, 3) if fair_price else 0
        
        listing = {
            "rank": 0, # Will be sorted by frontend
            "id": f"agent_{hash(url)}",
            "url": url,
            "title": title,
            "city": "Extracted from context",
            "price_mad": price_mad,
            "fair_price_mad": fair_price,
            "price_vs_market_pct": pct_diff,
            "year": year,
            "mileage_km": mileage_km,
            "fuel_type": "unknown",
            "transmission": "unknown",
            "condition": "unknown",
            "score": score,
            "verdict": verdict,
            "flags": flags, # Should be list of dicts like {"id": "x", "label": "y", "severity": "HIGH", "penalty": 35}
            "react_ran": True,
            "react_verdict": verdict,
            "react_reason": "Evaluated by Autonomous Agent",
            "react_adjusted_score": score,
            "negotiation_tip": negotiation_tip,
            "summary_fr": "Evaluated by AI Agent.",
            "photos": [],
            "negotiable": True,
            "seller_type": "unknown",
        }
        
        store.append("results.json", listing)
        self.scraped_urls.add(url)
        return f"Successfully saved listing to database."

    def close(self):
        print("[System] Closing browser...")
        self.driver.quit()
