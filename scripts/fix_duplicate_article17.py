#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 17 중복 캡션 라인 삭제 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 17).single().execute()
content = response.data['content']

lines = content.split('\n')

# Find and remove line 84 (0-indexed: 83) if it contains the duplicate text
target_text = '[한국일보](https://www.hankookilbo.com/News/Read/201910141081095428) 제공, SuperM 빌보드 200 1위 달성'

lines_to_remove = []

for i, line in enumerate(lines):
    stripped = line.strip()
    # Check if this line matches the duplicate text pattern
    if target_text in stripped and not stripped.startswith('!['):
        lines_to_remove.append(i)
        print(f'❌ 삭제할 라인 {i+1}: {line[:100]}')

# Remove the lines
if lines_to_remove:
    print(f'\n📊 총 {len(lines_to_remove)}개 라인 삭제')
    new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
    content = '\n'.join(new_lines)

    # Update database
    print('\n💾 데이터베이스 업데이트 중...')
    try:
        supabase.table('articles').update({'content': content}).eq('article_number', 17).execute()
        print('✅ Article 17 중복 캡션 텍스트 삭제 완료!')
    except Exception as e:
        print(f'❌ 업데이트 실패: {e}')
else:
    print('\n✅ 삭제할 중복 캡션 텍스트를 찾을 수 없습니다.')
