#!/usr/bin/env python3
import os
import re
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [11] Article 11 최종 수정 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 11).single().execute()
content = response.data['content']

# Get the public URL for the uploaded image
public_url = 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/11-nct-lightstick.jpg'

# Fix image line - find any line with '엔시티' and '응원봉'
lines = content.split('\n')
fixed_image = False

for i, line in enumerate(lines):
    if '엔시티' in line and '응원봉' in line and '![' in line:
        # Replace entire line with corrected version (no leading spaces)
        lines[i] = f'![NCT 응원봉]({public_url})'
        print(f'✅ 라인 {i+1}: 이미지 수정')
        fixed_image = True
        break

if not fixed_image:
    print('⚠️  이미지 라인을 찾을 수 없음')

content = '\n'.join(lines)

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 11).execute()
    print('✅ Article 11 이미지 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')

# Verify
print('\n🔍 수정 결과 확인...')
response = supabase.table('articles').select('content').eq('article_number', 11).single().execute()
content = response.data['content']
lines = content.split('\n')

has_issues = False
for i, line in enumerate(lines, 1):
    leading_spaces = len(line) - len(line.lstrip())
    if leading_spaces >= 4 and line.strip():
        print(f'⚠️  라인 {i}에 여전히 {leading_spaces}개의 leading spaces')
        has_issues = True

if not has_issues:
    print('✅ 모든 렌더링 문제 해결!')
