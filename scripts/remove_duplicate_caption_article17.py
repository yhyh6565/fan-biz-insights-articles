#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 17 중복 캡션 텍스트 삭제 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 17).single().execute()
content = response.data['content']

lines = content.split('\n')

# Find and show the problematic lines around line 82-84
print('🔍 라인 80-90 확인:')
for i in range(79, min(91, len(lines))):
    if lines[i].strip():
        print(f'  라인 {i+1}: {lines[i][:120]}')

# Find lines to remove: lines after images that duplicate the caption
lines_to_remove = []

for i, line in enumerate(lines):
    # If this is an image line
    if line.strip().startswith('![') and '](' in line:
        # Extract caption from image
        caption_start = line.find('![') + 2
        caption_end = line.find('](')
        caption = line[caption_start:caption_end]

        # Check next non-empty line
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1

        if j < len(lines):
            next_line = lines[j].strip()

            # Check if next line contains the same text (might have link)
            # Remove link markdown to compare text
            next_line_text = next_line
            if '[' in next_line_text and '](' in next_line_text:
                # Extract text from markdown link
                import re
                # Replace [text](url) with text
                next_line_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', next_line_text)

            caption_text = caption
            if '[' in caption_text and '](' in caption_text:
                import re
                caption_text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', caption_text)

            # If texts match, mark for removal
            if next_line_text == caption_text or next_line == caption:
                lines_to_remove.append(j)
                print(f'\n❌ 삭제할 라인 {j+1}: {lines[j][:100]}')

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
