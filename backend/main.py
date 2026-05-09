import os
import sys
import json
import time
from dotenv import load_dotenv
import google.generativeai as genai

from agent.baseline_builder import build_baseline, build_url
from agent.prompt import SYSTEM_PROMPT
from agent.tools import AgentTools
from config import SEARCH_CONFIG
from storage import store

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("============================================================")
print("  CARS MAR — Autonomous AI Scouting Agent")
print(f"  Searching: {SEARCH_CONFIG['model']} | Min year: {SEARCH_CONFIG['min_year']}")
print("============================================================")

def run_agent():
    # Step 1: Pre-computation
    print("\n[1/3] Pre-computing market baseline...")
    baseline = build_baseline()
    
    # Empty results file
    store.save("results.json", [])
    
    # Step 2: Init Selenium Tools
    print("\n[2/3] Initializing Selenium browser...")
    agent_tools = AgentTools()
    
    # Wrapper functions for Gemini
    def click_link(url: str) -> str:
        """Navigates the browser to a specific URL (used for clicking links)."""
        return agent_tools.navigate_to(url)
        
    def scroll_page(direction: str) -> str:
        """Scrolls the page down or up to reveal more content."""
        return agent_tools.scroll_page(direction)
        
    def get_page_content() -> str:
        """Extracts visible text and links from the current page."""
        return agent_tools.get_page_content()
        
    def go_back() -> str:
        """Navigates back to the previous page."""
        return agent_tools.go_back()
        
    def get_market_baseline() -> str:
        """Reads the pre-calculated market baseline JSON data."""
        return agent_tools.get_market_baseline()
        
    def evaluate_and_save_listing(url: str, title: str, price_mad: int, year: int, mileage_km: int, score: int, verdict: str, negotiation_tip: str) -> str:
        """Saves a fully evaluated car listing to the database."""
        # Generating empty flags list for now as param simplification
        return agent_tools.evaluate_and_save_listing(url, title, price_mad, year, mileage_km, score, verdict, negotiation_tip, [])

    tools_list = [click_link, scroll_page, get_page_content, go_back, get_market_baseline, evaluate_and_save_listing]

    # Step 3: Run Gemini Loop
    print("\n[3/3] Starting Autonomous Agent Loop...")
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        tools=tools_list,
        system_instruction=SYSTEM_PROMPT
    )
    
    chat = model.start_chat(enable_automatic_function_calling=False)
    
    start_url = build_url(SEARCH_CONFIG["model"], SEARCH_CONFIG["cities"][0])
    agent_tools.navigate_to(start_url)
    
    prompt = f"I have opened the browser to the search page for {SEARCH_CONFIG['cities'][0]}. Your goal is to find 5 good deals. Begin your scouting. REMEMBER: Never evaluate without clicking, and explain your reasoning first."
    
    # Mapping tool names to the actual functions
    tool_map = {
        "click_link": click_link,
        "scroll_page": scroll_page,
        "get_page_content": get_page_content,
        "go_back": go_back,
        "get_market_baseline": get_market_baseline,
        "evaluate_and_save_listing": evaluate_and_save_listing
    }
    
    try:
        current_message = prompt
        
        # We will loop until the agent stops calling tools or we hit the limit
        for _ in range(30):
            if len(agent_tools.scraped_urls) >= 5:
                print("\n[System] Agent successfully found 5 deals. Stopping.")
                break
                
            response = chat.send_message(current_message)
            
            # Print any text reasoning the agent provided
            reasoning = ""
            for part in response.parts:
                try:
                    if part.text:
                        reasoning += part.text
                except ValueError:
                    pass
            
            if reasoning:
                print(f"\n[Agent Thought] {reasoning}")
                
            # Check for function calls
            function_calls = []
            for part in response.parts:
                if part.function_call:
                    function_calls.append(part.function_call)
                    
            if not function_calls:
                # If no function call, ask it to continue
                print("\n[System] Agent didn't call a tool. Prompting to continue...")
                current_message = "Please continue scouting and use your tools to navigate and evaluate."
                time.sleep(2)
                continue
                
            # Execute the function calls
            function_responses = []
            for function_call in function_calls:
                name = function_call.name
                args = {k: v for k, v in function_call.args.items()}
                
                print(f"\n[Agent Tool Call] -> {name}({args})")
                
                if name in tool_map:
                    try:
                        result = tool_map[name](**args)
                    except Exception as e:
                        result = f"Error executing {name}: {str(e)}"
                else:
                    result = f"Tool {name} not found."
                    
                # Format the response back to Gemini
                function_responses.append({
                    "function_response": {
                        "name": name,
                        "response": {"result": result}
                    }
                })
                
            # Send the results back as the next message
            current_message = function_responses
            time.sleep(1) # Small pause to avoid rapid rate limits

    except Exception as e:
        print(f"\n[Agent Error] {e}")
    finally:
        agent_tools.close()
        print("\nAgent finished execution.")

if __name__ == "__main__":
    run_agent()
