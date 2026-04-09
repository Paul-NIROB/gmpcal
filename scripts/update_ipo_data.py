import os
import json
import datetime
import random
import re

DATA_FILE_PATH = "js/data.js"

def update_status_by_date(ipo, today):
    """
    Updates the status of an IPO based on the current date.
    """
    open_date = datetime.datetime.strptime(ipo['openDate'], '%Y-%m-%d').date()
    close_date = datetime.datetime.strptime(ipo['closeDate'], '%Y-%m-%d').date()
    listing_date = datetime.datetime.strptime(ipo['listingDate'], '%Y-%m-%d').date()

    if today < open_date:
        ipo['status'] = 'Upcoming'
    elif open_date <= today <= close_date:
        ipo['status'] = 'Open'
    elif close_date < today < listing_date:
        ipo['status'] = 'Closed'
    else:
        ipo['status'] = 'Listed'
    
    return ipo

def update_data_js():
    """
    Reads data.js, parses the array, updates values based on dates, and writes back.
    """
    if not os.path.exists(DATA_FILE_PATH):
        print(f"Error: {DATA_FILE_PATH} not found.")
        return

    with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the ipoData array using regex (since it's JS, not pure JSON)
    # This is a bit tricky, so we'll look for the content between [ and ];
    match = re.search(r'const ipoData = (\[[\s\S]*?\]);', content)
    if not match:
        print("Could not find ipoData array in data.js")
        return

    # To process it easily, we'll convert the JS-like string to a Python list
    # Note: This simple approach assumes the JS is formatted cleanly like JSON
    # For a robust solution, we'd use a JS parser, but here we'll use a more surgical regex approach
    
    today = datetime.date.today()
    last_updated_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")

    # Surgical updates using Regex to maintain the JS formatting
    def update_ipo_block(ipo_match):
        block = ipo_match.group(0)
        
        # Extract dates
        try:
            open_d = re.search(r'openDate: "(.*?)"', block).group(1)
            close_d = re.search(r'closeDate: "(.*?)"', block).group(1)
            listing_d = re.search(r'listingDate: "(.*?)"', block).group(1)
            
            open_date = datetime.datetime.strptime(open_d, '%Y-%m-%d').date()
            close_date = datetime.datetime.strptime(close_d, '%Y-%m-%d').date()
            listing_date = datetime.datetime.strptime(listing_d, '%Y-%m-%d').date()
            
            # Determine new status
            new_status = ""
            if today < open_date: new_status = 'Upcoming'
            elif open_date <= today <= close_date: new_status = 'Open'
            elif close_date < today < listing_date: new_status = 'Closed'
            else: new_status = 'Listed'
            
            # Update Status
            block = re.sub(r'status: ".*?"', f'status: "{new_status}"', block)
            
            # Fluctuate GMP for Open/Upcoming IPOs
            if new_status in ['Open', 'Upcoming']:
                gmp_val_match = re.search(r'gmp: "₹(\d+)', block)
                if gmp_val_match:
                    old_gmp = int(gmp_val_match.group(1))
                    change = random.randint(-5, 10)
                    new_gmp = max(0, old_gmp + change)
                    block = block.replace(f'gmp: "₹{old_gmp}', f'gmp: "₹{new_gmp}')
            
            # Update lastUpdated
            block = re.sub(r'lastUpdated: ".*?"', f'lastUpdated: "{last_updated_str}"', block)
            
        except Exception as e:
            print(f"Error processing IPO block: {e}")
            
        return block

    # Apply updates to each IPO object in the JS file
    updated_content = re.sub(r'\{[\s\S]*?\}', update_ipo_block, content)

    # Add a news entry
    news_entry = f"""
    {{
        id: {int(datetime.datetime.now().timestamp())},
        title: "Daily IPO Status Sync: {datetime.datetime.now().strftime('%B %d, %Y')}",
        date: "{datetime.datetime.now().strftime('%Y-%m-%d')}",
        summary: "Automation synced IPO statuses with today's date ({today}). Upcoming and Recent sections updated."
    }},"""
    
    updated_content = updated_content.replace(
        'const newsData = [',
        f'const newsData = [{news_entry}'
    )

    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print(f"Successfully synced IPO statuses for {today}.")

if __name__ == "__main__":
    update_data_js()
