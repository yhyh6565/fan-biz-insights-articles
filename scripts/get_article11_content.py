#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

response = supabase.table('articles').select('content').eq('article_number', 11).single().execute()
content = response.data['content']

# Save to file for easier viewing
with open('/tmp/article11_content.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print('Content saved to /tmp/article11_content.txt')
print(f'Total length: {len(content)} characters\n')

# Check for common issues
lines = content.split('\n')
print(f'Total lines: {len(lines)}\n')

# Find lines with image syntax
print('=== Image lines ===')
for i, line in enumerate(lines, 1):
    if '![' in line and '](' in line:
        leading_spaces = len(line) - len(line.lstrip())
        print(f'Line {i} (spaces: {leading_spaces}): {line[:100]}...' if len(line) > 100 else f'Line {i} (spaces: {leading_spaces}): {line}')

print('\n=== Lines with 4+ leading spaces (potential code blocks) ===')
for i, line in enumerate(lines, 1):
    if len(line) - len(line.lstrip()) >= 4 and line.strip():
        print(f'Line {i}: {line[:100]}...' if len(line) > 100 else f'Line {i}: {line}')
