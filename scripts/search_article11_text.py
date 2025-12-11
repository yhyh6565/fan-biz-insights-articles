#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

response = supabase.table('articles').select('content').eq('article_number', 11).single().execute()
content = response.data['content']

# Find lines containing the text
search_text = '모든 유닛이 다르되'
lines = content.split('\n')

for i, line in enumerate(lines, 1):
    if search_text in line:
        print(f'=== Line {i} ===')
        print(f'Raw: {repr(line)}')
        print(f'\nDisplayed:\n{line}\n')
