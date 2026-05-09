import os
from dotenv import load_dotenv
load_dotenv()

SEARCH_CONFIG = {
    "model":            "Dacia Logan",       # car model to search for
    "budget":           85000,               # in MAD, soft upper limit
    "budget_tolerance": 0.20,                # accept up to 20% above budget
    "min_year":         2022,
    "cities":           ["Casablanca", "Rabat", "Salé", "Marrakech"],
    "max_listings":     100,
    "currency":         "MAD"
}

GEMINI_FLASH = "gemini-1.5-flash"   # used for bulk parsing and tips
GEMINI_PRO   = "gemini-1.5-pro"     # used ONLY for the ReAct loop
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Which listings trigger the expensive ReAct loop
REACT_TRIGGERS = {
    "has_high_flag":     True,    # any HIGH severity flag fires ReAct
    "score_range":       (40, 72),  # borderline scores
    "price_below_pct":  -0.25     # price more than 25% below fair value
}
