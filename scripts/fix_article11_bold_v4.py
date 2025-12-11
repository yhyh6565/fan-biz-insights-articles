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

# The exact line from the database (copied from repr())
old_line = 'NCT는 이러한 '네오함'을 음악, 퍼포먼스, 비주얼 전반에 걸쳐 구현하며 "**모든 유닛이 다르되, 모두 NCT다"**라는 메시지를 브랜드 차원에서 일관되게 전달하고 있습니다.'
new_line = 'NCT는 이러한 '네오함'을 음악, 퍼포먼스, 비주얼 전반에 걸쳐 구현하며 "모든 유닛이 다르되, 모두 NCT다"라는 메시지를 브랜드 차원에서 일관되게 전달하고 있습니다.'

if old_line in content:
    content = content.replace(old_line, new_line)
    print('✅ 볼드 제거 완료')
    print(f'   Before: ...구현하며 "**모든 유닛이 다르되, 모두 NCT다"**라는...')
    print(f'   After:  ...구현하며 "모든 유닛이 다르되, 모두 NCT다"라는...')
else:
    print('⚠️  정확한 라인을 찾을 수 없음')

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 11).execute()
    print('✅ Article 11 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
