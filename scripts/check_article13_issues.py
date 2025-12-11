#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔍 Article 13 최종 검증 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

lines = content.split('\n')

# Check for issues
duplicate_captions = []
leading_space_issues = []

for i, line in enumerate(lines):
    # Check for leading spaces (4+)
    leading_spaces = len(line) - len(line.lstrip())
    if leading_spaces >= 4 and line.strip():
        leading_space_issues.append((i+1, leading_spaces, line.strip()[:60]))

    # Check for duplicate captions
    if line.strip().startswith('![') and '](' in line:
        caption_start = line.find('![') + 2
        caption_end = line.find('](')
        caption = line[caption_start:caption_end]

        # Check if next non-empty line is the same caption
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1

        if j < len(lines) and lines[j].strip() == caption:
            duplicate_captions.append((i+1, j+1, caption))

print('📊 검증 결과:\n')

if leading_space_issues:
    print(f'⚠️  Leading space 문제: {len(leading_space_issues)}개')
    for line_num, spaces, text in leading_space_issues[:5]:
        print(f'  라인 {line_num} ({spaces} spaces): {text}...')
else:
    print('✅ Leading space 문제 없음')

if duplicate_captions:
    print(f'\n⚠️  중복 캡션: {len(duplicate_captions)}개')
    for img_line, dup_line, caption in duplicate_captions:
        print(f'  라인 {img_line}의 캡션이 라인 {dup_line}에 중복: {caption[:50]}...')
else:
    print('✅ 중복 캡션 없음')

if not leading_space_issues and not duplicate_captions:
    print('\n🎉 Article 13이 완벽하게 수정되었습니다!')
