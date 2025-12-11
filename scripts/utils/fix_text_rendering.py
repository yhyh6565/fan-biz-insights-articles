#!/usr/bin/env python3
"""
범용 텍스트 렌더링 수정 스크립트
- 불필요한 들여쓰기 제거
- 중복 캡션 제거
- 마크다운 문법 오류 수정

사용법: python3 fix_text_rendering.py <article_number>
"""
import os
import sys
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def fix_text_rendering(article_number):
    """텍스트 렌더링 문제 수정"""
    print(f'📝 [#{article_number}] 텍스트 렌더링 수정 중...\n')

    # Get content
    response = supabase.table('articles').select('content').eq('article_number', article_number).single().execute()
    content = response.data['content']

    lines = content.split('\n')
    new_lines = []
    fixed_count = 0

    prev_line_was_image = False

    for i, line in enumerate(lines):
        leading_spaces = len(line) - len(line.lstrip())
        stripped = line.strip()

        # Track if previous line was image
        if stripped.startswith('![') and '](' in stripped:
            prev_line_was_image = True
            new_lines.append(line)
            continue

        # Remove duplicate captions (indented after images)
        if prev_line_was_image and leading_spaces == 4 and '제공' in stripped:
            fixed_count += 1
            print(f'✅ Line {i+1}: 중복 캡션 제거')
            prev_line_was_image = False
            continue

        prev_line_was_image = False

        # Remove unnecessary indentation from image lines
        if stripped.startswith('![') and leading_spaces > 0:
            new_lines.append(stripped)
            fixed_count += 1
            print(f'✅ Line {i+1}: 이미지 라인 들여쓰기 제거')
            continue

        new_lines.append(line)

    if fixed_count > 0:
        content = '\n'.join(new_lines)
        supabase.table('articles').update({'content': content}).eq('article_number', article_number).execute()
        print(f'\n✅ {fixed_count}개 항목 수정 완료!')
    else:
        print('\n✅ 수정할 항목 없음')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('사용법: python3 fix_text_rendering.py <article_number>')
        sys.exit(1)

    article_number = int(sys.argv[1])
    fix_text_rendering(article_number)
