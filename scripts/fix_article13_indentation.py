#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 13 들여쓰기 수정 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix 4-space indentation to 2-space for non-image lines
fixed_count = 0

for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Skip image lines
    if line.strip().startswith('!['):
        continue

    # Change 4 spaces to 2 spaces
    if leading_spaces == 4 and line.strip():
        lines[i] = '  ' + line.lstrip()  # 2 spaces + content
        fixed_count += 1
        print(f'✅ 라인 {i+1}: 4칸 → 2칸 들여쓰기')

content = '\n'.join(lines)

print(f'\n📊 총 {fixed_count}개 라인 수정')

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 13).execute()
    print('✅ Article 13 들여쓰기 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
