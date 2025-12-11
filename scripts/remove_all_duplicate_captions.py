#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔧 모든 글에서 중복 캡션 제거 중...\n')

# Get all articles
response = supabase.table('articles').select('article_number, title, content').order('article_number').execute()

total_removed = 0
articles_updated = 0

for article in response.data:
    article_num = article['article_number']
    title = article['title']
    content = article['content']
    lines = content.split('\n')

    # Find and remove duplicate captions
    removed_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]

        # Check if this is an image line
        if line.strip().startswith('![') and '](' in line:
            # Extract caption
            caption_start = line.find('![') + 2
            caption_end = line.find('](')
            if caption_start > 1 and caption_end > caption_start:
                caption = line[caption_start:caption_end]

                # Check if next non-empty line is the same caption
                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1

                if j < len(lines):
                    next_non_empty = lines[j].strip()

                    if next_non_empty == caption:
                        removed_lines.append(j)

        i += 1

    if removed_lines:
        # Remove duplicate lines (in reverse order)
        for idx in sorted(removed_lines, reverse=True):
            del lines[idx]

        content = '\n'.join(lines)

        # Update database
        try:
            supabase.table('articles').update({'content': content}).eq('article_number', article_num).execute()
            print(f'✅ [{article_num}] {title}: {len(removed_lines)}개 중복 캡션 제거')
            total_removed += len(removed_lines)
            articles_updated += 1
        except Exception as e:
            print(f'❌ [{article_num}] {title}: 업데이트 실패 - {e}')

print(f'\n✅ 작업 완료!')
print(f'   - 수정된 글: {articles_updated}개')
print(f'   - 제거된 중복 캡션: {total_removed}개')
