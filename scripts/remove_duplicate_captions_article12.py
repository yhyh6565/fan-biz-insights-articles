#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [12] Article 12 중복 캡션 제거 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 12).single().execute()
content = response.data['content']

lines = content.split('\n')

# Find and remove duplicate captions
removed_lines = []
i = 0
while i < len(lines):
    line = lines[i]

    # Check if this is an image line
    if line.strip().startswith('![') and '](' in line:
        # Extract caption from image markdown: ![caption](url)
        caption_start = line.find('![') + 2
        caption_end = line.find('](')
        if caption_start > 1 and caption_end > caption_start:
            caption = line[caption_start:caption_end]

            # Check if next non-empty line is the same caption
            if i + 1 < len(lines):
                next_line = lines[i + 1]

                # Skip empty lines
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1

                if j < len(lines):
                    next_non_empty = lines[j].strip()

                    # If next non-empty line matches caption, remove it
                    if next_non_empty == caption:
                        print(f'✅ 라인 {j+1}: "{caption}" 중복 제거')
                        removed_lines.append(j)

    i += 1

# Remove duplicate lines (in reverse order to maintain indices)
for idx in sorted(removed_lines, reverse=True):
    del lines[idx]

content = '\n'.join(lines)

print(f'\n✅ 총 {len(removed_lines)}개의 중복 캡션 제거')

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 12).execute()
    print('✅ Article 12 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
