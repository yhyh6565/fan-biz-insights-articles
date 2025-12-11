#!/usr/bin/env python3
import os
import re
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

print('📝 [10] 이미지 표시 크기 조정 중...\n')

response = supabase.table('articles').select('content').eq('article_number', 10).single().execute()
content = response.data['content']

# 로고 이미지들 (50% 크기 = width="250")
logo_patterns = [
    '10-exo-mama-logo.jpg',
    '10-exo-overdose-logo.png',
    '10-exo-monster-logo.png',
    '10-exo-lucky-one-logo.png'
]

# 나머지 이미지들 (70% 크기 = width="400")
other_patterns = [
    '10-fx-albums.png',
    '10-fx-pink-tape.jpg',
    '10-fx-art-film-1.jpg',
    '10-fx-art-film-2.jpg',
    '10-fx-art-film-3.jpg',
    '10-fx-4walls.jpg',
    '10-fx-4walls-concept.jpg',
    '10-nct-starbucks.jpg'
]

# 마크다운 이미지를 HTML img 태그로 변경
def convert_to_html_img(match, width):
    alt_text = match.group(1)
    url = match.group(2)
    return f'<img src="{url}" alt="{alt_text}" width="{width}" />'

count = 0

# 로고 이미지들 (width="250")
for pattern in logo_patterns:
    regex = rf'!\[([^\]]+)\]\(([^)]*{re.escape(pattern)}[^)]*)\)'
    matches = re.findall(regex, content)
    if matches:
        content = re.sub(regex, lambda m: convert_to_html_img(m, 250), content)
        print(f'✅ {pattern}: width="250"')
        count += len(matches)

# 나머지 이미지들 (width="400")
for pattern in other_patterns:
    regex = rf'!\[([^\]]+)\]\(([^)]*{re.escape(pattern)}[^)]*)\)'
    matches = re.findall(regex, content)
    if matches:
        content = re.sub(regex, lambda m: convert_to_html_img(m, 400), content)
        print(f'✅ {pattern}: width="400"')
        count += len(matches)

# DB 업데이트
supabase.table('articles').update({'content': content}).eq('article_number', 10).execute()
print(f'\n✅ 총 {count}개 이미지 표시 크기 조정 완료!')
