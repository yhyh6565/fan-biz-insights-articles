#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔍 Article 17 분석 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 17).single().execute()
content = response.data['content']

# Save to file for inspection
with open('/tmp/article17_content.txt', 'w', encoding='utf-8') as f:
    f.write(content)

lines = content.split('\n')

# Analyze issues
print('📊 분석 결과:\n')

# 1. Image issues
image_lines = []
local_images = 0
supabase_images = 0

for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        image_lines.append((i+1, line.strip()))
        if 'supabase' in line:
            supabase_images += 1
        else:
            local_images += 1

print(f'1️⃣ 이미지: 총 {len(image_lines)}개')
print(f'   - Supabase URL: {supabase_images}개')
print(f'   - 로컬/문제 경로: {local_images}개\n')

if local_images > 0:
    print('⚠️  문제 이미지:')
    for line_num, line in image_lines:
        if 'supabase' not in line:
            print(f'   라인 {line_num}: {line[:120]}...')
    print()

# 2. Leading spaces (4+)
leading_space_issues = []
for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())
    if leading_spaces >= 4 and line.strip() and not line.strip().startswith('!['):
        leading_space_issues.append((i+1, leading_spaces, line.strip()[:80]))

print(f'2️⃣ Leading space 문제: {len(leading_space_issues)}개')
if leading_space_issues:
    print('⚠️  문제 라인 (처음 10개):')
    for line_num, spaces, text in leading_space_issues[:10]:
        print(f'   라인 {line_num} ({spaces} spaces): {text}...')
    print()

# 3. Duplicate captions
duplicate_captions = []
for i, line in enumerate(lines):
    if line.strip().startswith('![') and '](' in line:
        caption_start = line.find('![') + 2
        caption_end = line.find('](')
        caption = line[caption_start:caption_end]

        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1

        if j < len(lines) and lines[j].strip() == caption:
            duplicate_captions.append((i+1, j+1, caption))

print(f'3️⃣ 중복 캡션: {len(duplicate_captions)}개')
if duplicate_captions:
    for img_line, dup_line, caption in duplicate_captions:
        print(f'   라인 {img_line}의 캡션이 라인 {dup_line}에 중복: {caption[:50]}...')

print(f'\n💾 전체 내용이 /tmp/article17_content.txt에 저장되었습니다.')
