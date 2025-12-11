#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [13] Article 13 남은 이미지 수정 중...\n')

# Image URL mapping
image_map = {
    '엑소_마마.webp': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-mama.webp',
    '엑소_초능력': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-superpowers.webp',
    '엑소엘_홈페이지.jpg': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exol-homepage.jpg',
    '엑소_초능력_목걸이.jpg': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-necklace.jpg',
    '엑소_오브.png': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-obsession.png',
    'image 1.png': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-sales.png',
}

# Get content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix remaining images
for i, line in enumerate(lines):
    if '![' in line and 'EXO%EB%A5%BC' in line:
        # Remove leading spaces
        clean_line = line.lstrip()

        # Extract caption
        caption_start = clean_line.find('![') + 2
        caption_end = clean_line.find('](')
        caption = clean_line[caption_start:caption_end] if caption_end > caption_start else ''

        # Determine which image it is and replace
        if '%EB%A7%88%EB%A7%88' in line:  # 마마
            lines[i] = f'![SM 엔터테인먼트 제공]({image_map["엑소_마마.webp"]})'
            print(f'✅ 라인 {i+1}: MAMA 이미지 수정')
        elif '%EC%B4%88%EB%8A%A5%EB%A0%A5.webp' in line or '%EC%B4%88%EB%8A%A5%EB%A0%A5%20%EB%B3%B5%EC%82%AC%EB%B3%B8' in line:  # 초능력
            lines[i] = f'![SM 엔터테인먼트 제공]({image_map["엑소_초능력"]})'
            print(f'✅ 라인 {i+1}: 초능력 이미지 수정')
        elif '%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80' in line:  # 홈페이지
            lines[i] = f'![SM 엔터테인먼트 제공]({image_map["엑소엘_홈페이지.jpg"]})'
            print(f'✅ 라인 {i+1}: EXO-L 홈페이지 이미지 수정')
        elif '%EB%AA%A9%EA%B1%B8%EC%9D%B4' in line:  # 목걸이
            lines[i] = f'![EXO 초능력 목걸이 굿즈]({image_map["엑소_초능력_목걸이.jpg"]})'
            print(f'✅ 라인 {i+1}: 목걸이 이미지 수정')
        elif '%EC%98%A4%EB%B8%8C' in line:  # 오브
            lines[i] = f'![SM 엔터테인먼트 제공]({image_map["엑소_오브.png"]})'
            print(f'✅ 라인 {i+1}: Obsession 이미지 수정')
        elif 'image%201.png' in line or 'image 1.png' in line:  # 판매량
            lines[i] = f'![EXO 앨범 판매량 추이]({image_map["image 1.png"]})'
            print(f'✅ 라인 {i+1}: 판매량 그래프 수정')

content = '\n'.join(lines)

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 13).execute()
    print('✅ Article 13 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
