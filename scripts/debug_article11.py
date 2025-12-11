#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

response = supabase.table('articles').select('content').eq('article_number', 11).single().execute()
content = response.data['content']

lines = content.split('\n')

# Find line 45
print(f'=== Line 45 ===')
line = lines[44]  # 0-indexed
print(f'Raw: {repr(line)}')
print(f'Length: {len(line)}')
print(f'Leading spaces: {len(line) - len(line.lstrip())}')

# Check if it contains certain characters
print(f'\nContains "![": {"![" in line}')
print(f'Contains "엔시티": {"엔시티" in line}')
print(f'Contains "응원봉": {"응원봉" in line}')

# Show first 100 chars
print(f'\nFirst 100 chars: {line[:100]}')
