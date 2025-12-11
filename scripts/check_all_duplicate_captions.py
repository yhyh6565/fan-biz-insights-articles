#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔍 모든 글에서 중복 캡션 검사 중...\n')

# Get all articles
response = supabase.table('articles').select('article_number, title, content').order('article_number').execute()

articles_with_duplicates = []

for article in response.data:
    article_num = article['article_number']
    title = article['title']
    content = article['content']
    lines = content.split('\n')

    duplicates_found = []

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
                        duplicates_found.append({
                            'line': j + 1,
                            'caption': caption
                        })

        i += 1

    if duplicates_found:
        articles_with_duplicates.append({
            'number': article_num,
            'title': title,
            'duplicates': duplicates_found
        })

# Print results
if articles_with_duplicates:
    print('⚠️  중복 캡션이 발견된 글:\n')
    for article in articles_with_duplicates:
        print(f'[{article["number"]}] {article["title"]}')
        for dup in article['duplicates']:
            print(f'  - 라인 {dup["line"]}: "{dup["caption"]}"')
        print()

    print(f'\n총 {len(articles_with_duplicates)}개의 글에서 중복 캡션 발견')
else:
    print('✅ 중복 캡션이 없습니다!')
