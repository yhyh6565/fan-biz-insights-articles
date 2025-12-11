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

# Remove bold from the specific phrase
old_text = '"**모든 유닛이 다르되, 모두 NCT다"**'
new_text = '"모든 유닛이 다르되, 모두 NCT다"'

if old_text in content:
    content = content.replace(old_text, new_text)
    print(f'✅ 볼드 제거: {old_text} → {new_text}')
else:
    print(f'⚠️  해당 텍스트를 찾을 수 없음')
    # Try to find it anyway
    if '모든 유닛이 다르되, 모두 NCT다' in content:
        print('   (텍스트는 존재하지만 형식이 다름)')

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 11).execute()
    print('✅ Article 11 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
