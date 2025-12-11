#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 17 버블 중복 캡션 텍스트 삭제 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 17).single().execute()
content = response.data['content']

lines = content.split('\n')

# Find lines around the bubble image (around line 93)
print('🔍 라인 90-98 확인:')
for i in range(89, min(99, len(lines))):
    if lines[i].strip():
        print(f'  라인 {i+1}: {lines[i][:120]}')

# Find and remove duplicate text for bubble
target_text = '매일경제'  # Partial match since it might have link

lines_to_remove = []

for i, line in enumerate(lines):
    stripped = line.strip()
    # Check if this line contains the bubble duplicate text and is not an image line
    if '매일경제' in stripped and '버블' in stripped and '실적 추이' in stripped and not stripped.startswith('!['):
        lines_to_remove.append(i)
        print(f'\n❌ 삭제할 라인 {i+1}: {line[:100]}')

# Remove the lines
if lines_to_remove:
    print(f'\n📊 총 {len(lines_to_remove)}개 라인 삭제')
    new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
    content = '\n'.join(new_lines)

    # Update database
    print('\n💾 데이터베이스 업데이트 중...')
    try:
        supabase.table('articles').update({'content': content}).eq('article_number', 17).execute()
        print('✅ Article 17 버블 중복 캡션 텍스트 삭제 완료!')
    except Exception as e:
        print(f'❌ 업데이트 실패: {e}')
else:
    print('\n✅ 삭제할 중복 캡션 텍스트를 찾을 수 없습니다.')
