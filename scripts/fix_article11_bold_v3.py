#!/usr/bin/env python3
import os
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

# Replace entire line
lines = content.split('\n')

for i, line in enumerate(lines):
    if '모든 유닛이 다르되, 모두 NCT다' in line and '**' in line:
        # Replace the entire line
        old_line = line
        # Remove ** around the quoted text
        new_line = line.replace('"**모든 유닛이 다르되, 모두 NCT다"**', '"모든 유닛이 다르되, 모두 NCT다"')

        if old_line != new_line:
            lines[i] = new_line
            print(f'✅ 라인 {i+1}: 볼드 제거')
            print(f'   Before: {old_line}')
            print(f'   After:  {new_line}')
        else:
            # Try with different quote styles
            new_line = line.replace('**모든 유닛이 다르되, 모두 NCT다"**', '모든 유닛이 다르되, 모두 NCT다"')
            if old_line != new_line:
                lines[i] = new_line
                print(f'✅ 라인 {i+1}: 볼드 제거 (quote style 2)')
                print(f'   Before: {old_line}')
                print(f'   After:  {new_line}')

content = '\n'.join(lines)

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 11).execute()
    print('✅ Article 11 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
