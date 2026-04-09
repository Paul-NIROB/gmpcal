import os
import json
import datetime
import requests

# Mock IPO data source (Replace with a real API later)
# Example: RapidAPI Indian Stock Market API
# Example URL: https://indian-stock-market-api1.p.rapidapi.com/ipos
SOURCE_API_URL = "https://mock.ipoapi.com/latest" 

DATA_FILE_PATH = "js/data.js"

def fetch_latest_ipo_data():
    """
    Fetch live IPO data from an API or public source.
    For now, this returns mocked data that would be updated daily.
    """
    print(f"Fetching data from {SOURCE_API_URL}...")
    
    # Simulate an API call
    # In a real scenario, you would use:
    # response = requests.get(SOURCE_API_URL, headers={"X-RapidAPI-Key": os.environ.get("API_KEY")})
    # if response.status_code == 200: return response.json()
    
    # For now, we simulate an update to the first IPO in data.js
    # (In a real script, you would fetch all and map them to our format)
    
    today = datetime.datetime.now()
    last_updated_str = today.strftime("%Y-%m-%d %I:%M %p")
    
    # Return a simulated update
    return {
        "last_updated": last_updated_str,
        # In a real case, this would be a full array of IPOs
    }

def update_data_js(new_data):
    """
    Read data.js, update the data, and write it back.
    """
    if not os.path.exists(DATA_FILE_PATH):
        print(f"Error: {DATA_FILE_PATH} not found.")
        return

    with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update the lastUpdated field in the first IPO as a demo of automation
    # A real script would replace the entire ipoData array
    
    # Simplified approach for this demo:
    # Find the line 'lastUpdated: "...",' and replace it with current time
    import re
    
    updated_content = re.sub(
        r'lastUpdated: ".*?",',
        f'lastUpdated: "{new_data["last_updated"]}",',
        content
    )
    
    # Also update the newsData with a fresh daily update entry
    news_entry = f"""
    {{
        id: 999,
        title: "Daily Market Update: {datetime.datetime.now().strftime('%B %d, %Y')}",
        date: "{datetime.datetime.now().strftime('%Y-%m-%d')}",
        summary: "Automation successfully updated the market data at {new_data['last_updated']}."
    }},"""
    
    # Insert new news entry at the start of newsData
    updated_content = updated_content.replace(
        'const newsData = [',
        f'const newsData = [{news_entry}'
    )

    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print(f"Successfully updated {DATA_FILE_PATH} at {new_data['last_updated']}.")

if __name__ == "__main__":
    latest_data = fetch_latest_ipo_data()
    update_data_js(latest_data)
