#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

response = supabase.table('articles').select('content').eq('article_number', 12).single().execute()
content = response.data['content']

# Save to file
with open('/tmp/article12_content.txt', 'w', encoding='utf-8') as f:
    f.write(content)

print('Content saved to /tmp/article12_content.txt')
print(f'Total length: {len(content)} characters\n')

lines = content.split('\n')
print(f'Total lines: {len(lines)}\n')

# Find image lines
print('=== Image lines ===')
for i, line in enumerate(lines, 1):
    if '![' in line and '](' in line:
        leading_spaces = len(line) - len(line.lstrip())
        print(f'Line {i} (spaces: {leading_spaces}): {line[:120]}...' if len(line) > 120 else f'Line {i} (spaces: {leading_spaces}): {line}')

print('\n=== Lines with 4+ leading spaces ===')
problem_count = 0
for i, line in enumerate(lines, 1):
    leading_spaces = len(line) - len(line.lstrip())
    if leading_spaces >= 4 and line.strip():
        problem_count += 1
        print(f'Line {i} (spaces: {leading_spaces}): {line[:100]}...' if len(line) > 100 else f'Line {i} (spaces: {leading_spaces}): {line}')

print(f'\nTotal problem lines: {problem_count}')
