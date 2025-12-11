#!/usr/bin/env python3
import os
import re
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [11] Article 11 볼드 제거 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 11).single().execute()
content = response.data['content']

# Find and replace the line
lines = content.split('\n')
modified = False

for i, line in enumerate(lines):
    if '모든 유닛이 다르되' in line:
        # Use regex to remove ** before and after the quoted text
        # Pattern: "**<text>"**  → "<text>"
        pattern = r'"(\*\*)([^"]+)("\*\*)'

        # Check if pattern exists
        if re.search(pattern, line):
            new_line = re.sub(pattern, r'"\2"', line)
            if new_line != line:
                print(f'✅ 라인 {i+1}: 볼드 제거')
                print(f'   Before: ...{line[40:100]}...')
                print(f'   After:  ...{new_line[40:100]}...')
                lines[i] = new_line
                modified = True
        else:
            # Try simpler approach: just remove all ** in the line
            if '**' in line:
                new_line = line.replace('**', '')
                print(f'✅ 라인 {i+1}: ** 제거')
                print(f'   Before: ...{line[40:100]}...')
                print(f'   After:  ...{new_line[40:100]}...')
                lines[i] = new_line
                modified = True

content = '\n'.join(lines)

if not modified:
    print('⚠️  수정할 내용을 찾지 못했습니다.')

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 11).execute()
    print('✅ Article 11 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
