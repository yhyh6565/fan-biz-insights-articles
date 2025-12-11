#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 13 마크다운 103-113 라인 업데이트 중...\n')

# Read markdown file lines 103-113
md_path = '/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/EXO를 해석하라, 세계관이 만든 밀리언셀러/EXO를 해석하라, 세계관이 만든 밀리언셀러.md'

with open(md_path, 'r', encoding='utf-8') as f:
    md_lines = f.readlines()

# Get lines 103-113 (0-indexed: 102-112)
updated_section = ''.join(md_lines[102:113]).rstrip()

print('📄 마크다운에서 읽은 내용 (103-113 라인):')
print(updated_section)
print('\n' + '='*60 + '\n')

# Get current database content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

# Find the section to replace in the database
# Look for the start pattern: "- **팬 커뮤니티의 자발적 참여 확대**"
# and end pattern: last line before "---"

lines = content.split('\n')

# Find start index
start_idx = None
for i, line in enumerate(lines):
    if '팬 커뮤니티의 자발적 참여 확대' in line:
        start_idx = i
        break

if start_idx is None:
    print('❌ 시작 라인을 찾을 수 없습니다.')
    exit(1)

# Find end index (look for the line containing "총 112만 장의 밀리언셀러를 달성")
end_idx = None
for i in range(start_idx, min(start_idx + 20, len(lines))):
    if '총 112만 장의 밀리언셀러를 달성' in lines[i]:
        end_idx = i
        break

if end_idx is None:
    print('❌ 끝 라인을 찾을 수 없습니다.')
    exit(1)

print(f'🔍 데이터베이스에서 발견: 라인 {start_idx+1}부터 {end_idx+1}까지')
print(f'📝 기존 내용:\n{chr(10).join(lines[start_idx:end_idx+1])}\n')

# Replace the section
new_lines = lines[:start_idx] + updated_section.split('\n') + lines[end_idx+1:]
new_content = '\n'.join(new_lines)

# Update database
print('💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': new_content}).eq('article_number', 13).execute()
    print('✅ Article 13 업데이트 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
