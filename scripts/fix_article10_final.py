#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [10] 최종 수정 중...\n')

# 1. 콘텐츠 가져오기
response = supabase.table('articles').select('content').eq('article_number', 10).single().execute()
content = response.data['content']

# 2. "-4_Walls.jpg)" 텍스트 제거
if '-4_Walls.jpg)' in content:
    content = content.replace('-4_Walls.jpg)', '')
    print('✅ "-4_Walls.jpg)" 텍스트 제거')

# 3. "🟧 *4 Walls* (2015)" 렌더링 수정
# 잘못된 형식을 찾아서 수정
lines = content.split('\n')
for i, line in enumerate(lines):
    # 이모지와 볼드가 제대로 처리되지 않은 경우
    if '4 Walls' in line and '🟧' in line:
        # 올바른 형식으로 수정: 🟧 **4 Walls** (2015)
        if '*4 Walls*' in line and not '**4 Walls**' in line:
            lines[i] = line.replace('*4 Walls*', '**4 Walls**')
            print(f'✅ 라인 {i+1}: 4 Walls 볼드 수정')

content = '\n'.join(lines)

# 4. DB 업데이트
supabase.table('articles').update({'content': content}).eq('article_number', 10).execute()
print('\n✅ 콘텐츠 수정 완료')

# 5. 이미지 크기 조정
print('\n📐 이미지 크기 조정 중...\n')

# 로고 이미지들 (50% 크기)
logo_images = [
    '10-exo-mama-logo.jpg',
    '10-exo-overdose-logo.png',
    '10-exo-monster-logo.png',
    '10-exo-lucky-one-logo.png'
]

# 나머지 이미지들 (70% 크기)
other_images = [
    '10-fx-albums.png',
    '10-fx-pink-tape.jpg',
    '10-fx-art-film-1.jpg',
    '10-fx-art-film-2.jpg',
    '10-fx-art-film-3.jpg',
    '10-fx-4walls.jpg',
    '10-fx-4walls-concept.jpg',
    '10-nct-starbucks.jpg'
]

def resize_image(storage_name, scale):
    storage_path = f"body-images/{storage_name}"

    try:
        # 다운로드
        res = supabase.storage.from_('article-images').download(storage_path)

        # 이미지 로드
        image = Image.open(io.BytesIO(res))
        width, height = image.size

        # 새 크기 계산
        new_width = int(width * scale)
        new_height = int(height * scale)

        # 리사이즈
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(f'  📐 {storage_name}: {width}x{height} → {new_width}x{new_height}')

        # 버퍼에 저장
        buffer = io.BytesIO()
        format = 'PNG' if storage_name.endswith('.png') else 'JPEG'
        image.save(buffer, format=format, quality=85, optimize=True)
        buffer.seek(0)

        # 재업로드
        supabase.storage.from_('article-images').upload(
            storage_path,
            buffer.read(),
            {'upsert': 'true', 'content-type': f'image/{format.lower()}'}
        )
        print(f'✅ {storage_name} 완료')

    except Exception as e:
        print(f'⚠️  {storage_name} 처리 실패: {e}')

# 로고 이미지 50% 크기로
print('로고 이미지 (50% 크기):')
for img in logo_images:
    resize_image(img, 0.5)

# 나머지 이미지 70% 크기로
print('\n일반 이미지 (70% 크기):')
for img in other_images:
    resize_image(img, 0.7)

print('\n✅ 모든 작업 완료!')
