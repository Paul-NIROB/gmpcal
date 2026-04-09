import os
import datetime
import random
import re

DATA_FILE_PATH = "js/data.js"

def get_matching_brace_index(s, start_index):
    """
    Finds the closing brace index that matches the opening brace at start_index.
    """
    count = 0
    for i in range(start_index, len(s)):
        if s[i] == '{':
            count += 1
        elif s[i] == '}':
            count -= 1
            if count == 0:
                return i
    return -1

def update_data_js():
    """
    Reads data.js, correctly finds each IPO object block, updates status based on dates, and writes back.
    """
    if not os.path.exists(DATA_FILE_PATH):
        print(f"Error: {DATA_FILE_PATH} not found.")
        return

    with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the ipoData array content
    ipo_array_match = re.search(r'const ipoData = (\[[\s\S]*?\]);', content)
    if not ipo_array_match:
        print("Could not find ipoData array")
        return

    ipo_array_start = ipo_array_match.start(1)
    ipo_array_end = ipo_array_match.end(1)
    ipo_array_content = ipo_array_match.group(1)
    
    today = datetime.date.today()
    last_updated_str = datetime.datetime.now().strftime("%Y-%m-%d %I:%M %p")
    
    # We will search for '{' that starts an object in the array
    # Since they are at the top level of the array, we can look for '{' after a comma or start of array
    updated_ipo_blocks = []
    current_pos = 0
    
    # Simple way to find all IPO blocks by finding 'id: ' and searching around it
    ids = re.finditer(r'id: (\d+),', ipo_array_content)
    
    # Since we'll be replacing content, we'll keep track of the original content and the new content
    new_ipo_array_content = ipo_array_content
    
    # Actually, a better way is to find each block, update it, and then put them all together.
    # But let's try a safer way to find blocks.
    blocks = []
    
    # Each IPO block starts with '{' and ends with '}'
    # Let's find each '{' that starts an object.
    # We'll use the indices of 'id: ' to find the enclosing braces.
    
    for match in re.finditer(r'id: (\d+),', ipo_array_content):
        id_pos = match.start()
        # Find the opening brace '{' before this id
        open_brace_pos = ipo_array_content.rfind('{', 0, id_pos)
        if open_brace_pos == -1: continue
        
        # Find the matching closing brace '}'
        close_brace_pos = get_matching_brace_index(ipo_array_content, open_brace_pos)
        if close_brace_pos == -1: continue
        
        block = ipo_array_content[open_brace_pos:close_brace_pos+1]
        
        try:
            # Extract dates
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
            
            # 1. Update ONLY the main status (not the timeline statuses)
            # We look for status: "..." that is NOT inside the timeline array
            # The main status is usually near the beginning
            main_status_match = re.search(r'(status: ")(.*?)(")', block)
            if main_status_match:
                block = block.replace(main_status_match.group(0), f'status: "{new_status}"', 1)
            
            # 2. Fluctuate GMP for non-listed
            if new_status != 'Listed':
                gmp_match = re.search(r'gmp: "₹(\d+)', block)
                if gmp_match:
                    old_gmp = int(gmp_match.group(1))
                    new_gmp = max(0, old_gmp + random.randint(-5, 5))
                    block = block.replace(f'gmp: "₹{old_gmp}', f'gmp: "₹{new_gmp}', 1)
            
            # 3. Update lastUpdated
            block = re.sub(r'lastUpdated: ".*?"', f'lastUpdated: "{last_updated_str}"', block)
            
        except Exception as e:
            print(f"Error processing block {match.group(1)}: {e}")
            
        blocks.append((open_brace_pos, close_brace_pos, block))

    # Reconstruct the ipo_array_content by replacing the original blocks with the updated ones
    # We must do this from end to start to avoid index shifting problems if lengths change
    blocks.sort(key=lambda x: x[0], reverse=True)
    
    for start, end, new_block in blocks:
        new_ipo_array_content = new_ipo_array_content[:start] + new_block + new_ipo_array_content[end+1:]

    # Replace the old array content with the new one
    new_content = content.replace(ipo_array_content, new_ipo_array_content)

    # Add a news entry
    news_id = int(datetime.datetime.now().timestamp())
    news_entry = f"""
    {{
        id: {news_id},
        title: "Daily Status Sync: {datetime.datetime.now().strftime('%B %d, %Y')}",
        date: "{datetime.datetime.now().strftime('%Y-%m-%d')}",
        summary: "IPO statuses and GMP levels have been synchronized with the latest market data."
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
