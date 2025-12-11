#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 14 중복 캡션 삭제 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 14).single().execute()
content = response.data['content']

lines = content.split('\n')

# Find and show the problematic lines around line 75-77
print('🔍 문제 라인 찾기:')
for i in range(70, min(82, len(lines))):
    if lines[i].strip():
        print(f'  라인 {i+1}: {lines[i][:100]}')

# Find lines to remove: "마블 제공. <어벤져스>(2012)에서의 뉴욕 전투 장면"
lines_to_remove = []
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped == '마블 제공. <어벤져스>(2012)에서의 뉴욕 전투 장면':
        lines_to_remove.append(i)
        print(f'\n❌ 삭제할 라인 {i+1}: {line}')
    elif stripped.startswith('[마블 제공. <어벤져스>(2012)에서의 뉴욕 전투 장면]'):
        lines_to_remove.append(i)
        print(f'\n❌ 삭제할 라인 {i+1}: {line}')

# Remove the lines
if lines_to_remove:
    print(f'\n📊 총 {len(lines_to_remove)}개 라인 삭제')
    new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
    content = '\n'.join(new_lines)

    # Update database
    print('\n💾 데이터베이스 업데이트 중...')
    try:
        supabase.table('articles').update({'content': content}).eq('article_number', 14).execute()
        print('✅ Article 14 중복 캡션 삭제 완료!')
    except Exception as e:
        print(f'❌ 업데이트 실패: {e}')
else:
    print('\n✅ 삭제할 중복 캡션을 찾을 수 없습니다.')
