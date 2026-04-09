import os
import json
import datetime
import random
import re

DATA_FILE_PATH = "js/data.js"

def update_data_js():
    """
    Reads data.js, parses each IPO object, updates status based on today's date, and writes back.
    """
    if not os.path.exists(DATA_FILE_PATH):
        print(f"Error: {DATA_FILE_PATH} not found.")
        return

    with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the content of the ipoData array
    ipo_array_match = re.search(r'const ipoData = (\[[\s\S]*?\]);', content)
    if not ipo_array_match:
        print("Could not find ipoData array")
        return

    ipo_array_str = ipo_array_match.group(1)
    
    # Use a more specific regex to match each individual IPO object { ... }
    # We look for blocks starting with { and ending with } that contain id:
    ipo_blocks = re.findall(r'\{[\s\S]*?id: \d+[\s\S]*?\}', ipo_array_str)
    
    today = datetime.date.today()
    last_updated_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
    
    updated_ipo_array = []
    
    for block in ipo_blocks:
        try:
            # Extract dates using specific regex
            open_d = re.search(r'openDate: "(.*?)"', block).group(1)
            close_d = re.search(r'closeDate: "(.*?)"', block).group(1)
            listing_d = re.search(r'listingDate: "(.*?)"', block).group(1)
            
            open_date = datetime.datetime.strptime(open_d, '%Y-%m-%d').date()
            close_date = datetime.datetime.strptime(close_d, '%Y-%m-%d').date()
            listing_date = datetime.datetime.strptime(listing_d, '%Y-%m-%d').date()
            
            # Determine new status based on today's date (April 09, 2026)
            new_status = ""
            if today < open_date: new_status = 'Upcoming'
            elif open_date <= today <= close_date: new_status = 'Open'
            elif close_date < today < listing_date: new_status = 'Closed'
            else: new_status = 'Listed'
            
            # Update the status field in the block
            block = re.sub(r'status: ".*?"', f'status: "{new_status}"', block)
            
            # Update lastUpdated field
            block = re.sub(r'lastUpdated: ".*?"', f'lastUpdated: "{last_updated_str}"', block)
            
            # Fluctuate GMP for non-listed IPOs
            if new_status != 'Listed':
                gmp_match = re.search(r'gmp: "₹(\d+)', block)
                if gmp_match:
                    old_gmp = int(gmp_match.group(1))
                    block = block.replace(f'gmp: "₹{old_gmp}', f'gmp: "₹{old_gmp + random.randint(-5, 5)}')

            updated_ipo_array.append(block)
            
        except Exception as e:
            print(f"Skipping block due to error: {e}")
            updated_ipo_array.append(block)

    # Reconstruct the ipoData array string
    new_ipo_array_str = "[\n    " + ",\n    ".join(updated_ipo_array) + "\n]"
    
    # Replace the old array with the new one in the full file content
    new_content = content.replace(ipo_array_match.group(1), new_ipo_array_str)

    # Add a news entry
    news_id = int(datetime.datetime.now().timestamp())
    news_entry = f"""
    {{
        id: {news_id},
        title: "Daily Status Sync: {datetime.datetime.now().strftime('%B %d, %Y')}",
        date: "{datetime.datetime.now().strftime('%Y-%m-%d')}",
        summary: "IPO statuses for Recent and Upcoming sections have been synchronized with today's market dates."
    }},"""
    
    new_content = new_content.replace(
        'const newsData = [',
        f'const newsData = [{news_entry}'
    )

    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Successfully synced IPO statuses for {today}.")

if __name__ == "__main__":
    update_data_js()
