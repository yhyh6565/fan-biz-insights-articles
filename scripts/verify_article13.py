#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔍 Article 13 이미지 검증 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

lines = content.split('\n')

# Find all image lines
image_count = 0
supabase_images = 0
local_images = 0
problematic_lines = []

for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        image_count += 1

        # Check if it's a Supabase URL
        if 'supabase.co' in line:
            supabase_images += 1
            # Extract caption
            caption_start = line.find('![') + 2
            caption_end = line.find('](')
            caption = line[caption_start:caption_end]
            print(f'✅ 라인 {i+1}: {caption}')
        else:
            local_images += 1
            print(f'❌ 라인 {i+1}: 로컬 경로 발견!')
            problematic_lines.append((i+1, line.strip()))

print(f'\n📊 결과:')
print(f'  총 이미지: {image_count}개')
print(f'  Supabase URL: {supabase_images}개')
print(f'  로컬 경로: {local_images}개')

if problematic_lines:
    print(f'\n⚠️  수정 필요한 라인:')
    for line_num, line in problematic_lines:
        print(f'  라인 {line_num}: {line[:80]}...')
else:
    print(f'\n🎉 모든 이미지가 제대로 렌더링됩니다!')
