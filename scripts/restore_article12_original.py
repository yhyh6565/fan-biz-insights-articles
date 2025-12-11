#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 12 원래 버전으로 복구 중...\n')

# Read original markdown file
md_file_path = '/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/세계관 하나로 2차 IP 매출 2.5배/세계관 하나로 2차 IP 매출 2.5배.md'

try:
    with open(md_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f'✅ 마크다운 파일 읽기 완료\n')

    # Replace image URLs with Supabase URLs
    content = content.replace(
        '![아이소이 제공](%EC%84%B8%EA%B3%84%EA%B4%80%20%ED%95%98%EB%82%98%EB%A1%9C%202%EC%B0%A8%20IP%20%EB%A7%A4%EC%B6%9C%202%205%EB%B0%B0/%E1%84%8B%E1%85%A1%E1%84%8B%E1%85%B5%E1%84%89%E1%85%A9%E1%84%8B%E1%85%B5.jpg)',
        '![아이소이 제공](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/12-aisoi.jpg)'
    )

    content = content.replace(
        '![빙그레 제공](%EC%84%B8%EA%B3%84%EA%B4%80%20%ED%95%98%EB%82%98%EB%A1%9C%202%EC%B0%A8%20IP%20%EB%A7%A4%EC%B6%9C%202%205%EB%B0%B0/%E1%84%87%E1%85%B5%E1%86%BC%E1%84%80%E1%85%B3%E1%84%85%E1%85%A6.jpg)',
        '![빙그레 제공](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/12-binggrae.jpg)'
    )

    print('✅ 이미지 URL 교체 완료\n')

    # Remove 4+ leading spaces
    lines = content.split('\n')
    fixed_count = 0

    for i, line in enumerate(lines):
        leading_spaces = len(line) - len(line.lstrip())

        # Skip image lines
        if '![' in line and 'supabase' in line:
            continue

        # Remove 4 leading spaces
        if leading_spaces == 4 and line.strip():
            lines[i] = line[4:]
            fixed_count += 1

    content = '\n'.join(lines)

    print(f'✅ {fixed_count}개 라인의 leading spaces 제거\n')

    # Remove duplicate captions
    lines = content.split('\n')
    removed_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]

        if line.strip().startswith('![') and '](' in line:
            caption_start = line.find('![') + 2
            caption_end = line.find('](')
            if caption_start > 1 and caption_end > caption_start:
                caption = line[caption_start:caption_end]

                j = i + 1
                while j < len(lines) and not lines[j].strip():
                    j += 1

                if j < len(lines):
                    next_non_empty = lines[j].strip()

                    if next_non_empty == caption:
                        removed_lines.append(j)

        i += 1

    for idx in sorted(removed_lines, reverse=True):
        del lines[idx]

    content = '\n'.join(lines)

    print(f'✅ {len(removed_lines)}개 중복 캡션 제거\n')

    # Update database
    supabase.table('articles').update({'content': content}).eq('article_number', 12).execute()

    print('✅ Article 12 원래 버전으로 복구 완료!')

except Exception as e:
    print(f'❌ 오류 발생: {e}')
