#!/usr/bin/env python3
"""
범용 이미지 렌더링 수정 스크립트
- 로컬/URL 인코딩된 경로를 Supabase URL로 교체
- alt 텍스트 안의 링크를 캡션으로 분리
- 중복 캡션 제거

사용법: python3 fix_image_rendering.py <article_number>
"""
import os
import sys
from supabase import create_client
from dotenv import load_dotenv
import re
import urllib.parse

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def fix_image_rendering(article_number):
    """이미지 렌더링 문제 수정"""
    print(f'📝 [#{article_number}] 이미지 렌더링 수정 중...\n')

    # Get content
    response = supabase.table('articles').select('content').eq('article_number', article_number).single().execute()
    content = response.data['content']

    lines = content.split('\n')
    new_lines = []
    fixed_count = 0

    for i, line in enumerate(lines):
        # Check if this is an image line
        if line.strip().startswith('![') and '](' in line:
            # Extract components
            alt_start = line.find('![') + 2
            alt_end = line.find('](')
            url_start = alt_end + 2
            url_end = line.rfind(')')

            if alt_end == -1 or url_end == -1:
                new_lines.append(line)
                continue

            alt_text = line[alt_start:alt_end]
            url = line[url_start:url_end]

            # Decode URL if encoded
            if '%' in url:
                url = urllib.parse.unquote(url)

            # Check if alt_text contains a link (problematic pattern)
            if '[' in alt_text and '](' in alt_text:
                # Pattern: [Source](link) 제공. Description
                try:
                    source_match = re.search(r'\[([^\]]+)\]\(([^\)]+)\)', alt_text)
                    if source_match and '제공' in alt_text:
                        source_name = source_match.group(1)
                        source_url = source_match.group(2)

                        # Extract description after 제공
                        desc_part = alt_text.split('제공')
                        if len(desc_part) > 1:
                            description = desc_part[1].strip(' .')

                            # Rebuild: image with description, then source
                            new_lines.append(f'![{description}]({url})')
                            new_lines.append(f'*[{source_name}]({source_url}) 제공*')
                            fixed_count += 1
                            print(f'✅ Line {i+1}: 출처 분리 - {source_name}')
                            continue
                except:
                    pass

            # Check if URL is still local path
            if url.startswith('./') or url.startswith('../'):
                print(f'⚠️  Line {i+1}: 여전히 로컬 경로 - {url[:50]}...')

            new_lines.append(line)
        else:
            new_lines.append(line)

    if fixed_count > 0:
        content = '\n'.join(new_lines)
        supabase.table('articles').update({'content': content}).eq('article_number', article_number).execute()
        print(f'\n✅ {fixed_count}개 이미지 수정 완료!')
    else:
        print('\n✅ 수정할 항목 없음')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('사용법: python3 fix_image_rendering.py <article_number>')
        sys.exit(1)

    article_number = int(sys.argv[1])
    fix_image_rendering(article_number)
