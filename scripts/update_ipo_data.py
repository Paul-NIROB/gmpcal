import os
import json
import datetime
import random
import re

DATA_FILE_PATH = "js/data.js"

def fetch_latest_ipo_data():
    """
    Simulates fetching fresh data.
    In a real scenario, this would be a requests.get() call to a real API.
    """
    today = datetime.datetime.now()
    last_updated_str = today.strftime("%Y-%m-%d %I:%M %p")
    
    # Generate some random updates for the demo
    return {
        "last_updated": last_updated_str,
        "gmp_change": random.randint(-10, 15), # Random GMP fluctuation
        "sub_change": round(random.uniform(0.1, 0.5), 1) # Random subscription increase
    }

def update_data_js(new_data):
    """
    Read data.js, update values, and write back.
    """
    if not os.path.exists(DATA_FILE_PATH):
        print(f"Error: {DATA_FILE_PATH} not found.")
        return

    with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the 'lastUpdated' field for all IPOs
    content = re.sub(
        r'lastUpdated: ".*?",',
        f'lastUpdated: "{new_data["last_updated"]}",',
        content
    )

    # 2. Simulate a live update for the first IPO (Tech Solutions India Ltd)
    # Let's find the first GMP value and increment it
    # Find gmp: "₹45 (17.44%)"
    gmp_match = re.search(r'gmp: "₹(\d+) \(', content)
    if gmp_match:
        old_gmp = int(gmp_match.group(1))
        new_gmp = old_gmp + new_data["gmp_change"]
        # Simple percentage calculation for the demo
        new_perc = round((new_gmp / 258) * 100, 2) 
        content = content.replace(
            f'gmp: "₹{old_gmp}',
            f'gmp: "₹{new_gmp}'
        )
        content = re.sub(r'\((\d+\.\d+)%\)', f'({new_perc}%)', content, count=1)

    # 3. Add a news entry for the update
    news_entry = f"""
    {{
        id: {int(datetime.datetime.now().timestamp())},
        title: "Live Market Update: {datetime.datetime.now().strftime('%B %d, %Y')}",
        date: "{datetime.datetime.now().strftime('%Y-%m-%d')}",
        summary: "Market data successfully refreshed. Tech Solutions GMP moved to ₹{new_gmp if 'new_gmp' in locals() else 'Updated'}."
    }},"""
    
    content = content.replace(
        'const newsData = [',
        f'const newsData = [{news_entry}'
    )

    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Successfully updated {DATA_FILE_PATH} with fresh data.")

if __name__ == "__main__":
    latest_data = fetch_latest_ipo_data()
    update_data_js(latest_data)
