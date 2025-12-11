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

print('📝 [13] Article 13 수정 중...\n')

# 1. Get folder path
with open('/tmp/article13_path.txt', 'r') as f:
    article_folder = f.read().strip()

# 2. Upload images
images_to_upload = [
    {'file': 'image.png', 'storage': '13-exo-teaser.png', 'caption': 'SM 엔터테인먼트 제공'},
    {'file': '엑소_마마.webp', 'storage': '13-exo-mama.webp', 'caption': 'SM 엔터테인먼트 제공'},
    {'file': '엑소_초능력.webp', 'storage': '13-exo-superpowers.webp', 'caption': 'SM 엔터테인먼트 제공'},
    {'file': '스크린샷_2025-03-30_오후_10.23.51.png', 'storage': '13-exo-fan-novel.png', 'caption': '서성성(2019), 『트랜스미디어 스토리텔링 기반 팬덤을 활용한 마케팅 전략 연구』, 성균관대 일반대학원 석사논문'},
    {'file': '엑소엘_홈페이지.jpg', 'storage': '13-exol-homepage.jpg', 'caption': 'SM 엔터테인먼트 제공'},
    {'file': '엑소_초능력_목걸이.jpg', 'storage': '13-exo-necklace.jpg', 'caption': 'EXO 초능력 목걸이 굿즈'},
    {'file': '스크린샷_2025-03-30_오후_6.23.40.png', 'storage': '13-exo-overdose.png', 'caption': 'SM 엔터테인먼트 제공'},
    {'file': '엑소_오브.png', 'storage': '13-exo-obsession.png', 'caption': 'SM 엔터테인먼트 제공'},
    {'file': '스크린샷_2025-03-30_오후_10.09.05.png', 'storage': '13-exo-pathcode.png', 'caption': 'SM 엔터테인먼트 제공, X @PathcodeEXO'},
    {'file': '스크린샷_2025-03-30_오후_10.40.00.png', 'storage': '13-exo-dontmessupmytempo.png', 'caption': 'SM 엔터테인먼트 제공'},
    {'file': 'image 1.png', 'storage': '13-exo-sales.png', 'caption': 'EXO 앨범 판매량 추이'},
]

uploaded_images = {}

for img in images_to_upload:
    image_path = os.path.join(article_folder, img['file'])
    storage_name = img['storage']

    print(f'📤 이미지 업로드 중: {storage_name}')

    try:
        # Load and optimize image
        with Image.open(image_path) as image:
            width, height = image.size
            print(f'  원본 크기: {width}x{height}')

            # Resize if needed (max width 800px)
            MAX_WIDTH = 800
            if width > MAX_WIDTH:
                new_height = int(height * (MAX_WIDTH / width))
                image = image.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                print(f'  리사이즈: {MAX_WIDTH}x{new_height}')

            # Save to buffer
            buffer = io.BytesIO()
            format = 'PNG' if storage_name.endswith('.png') else 'WEBP' if storage_name.endswith('.webp') else 'JPEG'
            if format == 'PNG':
                image.save(buffer, format=format, optimize=True)
            elif format == 'WEBP':
                image.save(buffer, format=format, quality=85, optimize=True)
            else:
                image.save(buffer, format=format, quality=85, optimize=True)
            buffer.seek(0)

            # Upload to Supabase
            storage_path = f'body-images/{storage_name}'
            content_type = f'image/{format.lower()}'
            if format == 'WEBP':
                content_type = 'image/webp'

            supabase.storage.from_('article-images').upload(
                storage_path,
                buffer.read(),
                {'upsert': 'true', 'content-type': content_type}
            )

            # Get public URL
            public_url = supabase.storage.from_('article-images').get_public_url(storage_path)
            print(f'✅ 업로드 완료: {public_url}\n')

            uploaded_images[img['file']] = {
                'url': public_url,
                'caption': img['caption']
            }

    except Exception as e:
        print(f'❌ 이미지 업로드 실패: {e}\n')

# 3. Get content and fix issues
print('📝 Content 수정 중...\n')

response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix images - replace with uploaded URLs and remove leading spaces
for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        # Extract current caption
        caption_start = line.find('![') + 2
        caption_end = line.find('](')

        if caption_start > 1 and caption_end > caption_start:
            # Remove leading spaces
            lines[i] = line.lstrip()

            # Replace with Supabase URL based on file pattern
            if 'image.png' in line and 'image 1' not in line:
                lines[i] = f'![SM 엔터테인먼트 제공]({uploaded_images["image.png"]["url"]})'
                print(f'✅ 라인 {i+1}: 티저 이미지 수정')
            elif '엑소_마마' in line or '%EB%A7%88%EB%A7%88' in line:
                lines[i] = f'![SM 엔터테인먼트 제공]({uploaded_images["엑소_마마.webp"]["url"]})'
                print(f'✅ 라인 {i+1}: MAMA 이미지 수정')
            elif '엑소_초능력.webp' in line or '엑소_초능력 복사본' in line or '%EC%B4%88%EB%8A%A5%EB%A0%A5.webp' in line:
                lines[i] = f'![SM 엔터테인먼트 제공]({uploaded_images["엑소_초능력.webp"]["url"]})'
                print(f'✅ 라인 {i+1}: 초능력 이미지 수정')
            elif '10.23.51' in line:
                lines[i] = f'![서성성(2019), 『트랜스미디어 스토리텔링 기반 팬덤을 활용한 마케팅 전략 연구』, 성균관대 일반대학원 석사논문]({uploaded_images["스크린샷_2025-03-30_오후_10.23.51.png"]["url"]})'
                print(f'✅ 라인 {i+1}: 팬 소설 이미지 수정')
            elif '엑소엘_홈페이지' in line or '%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80' in line:
                lines[i] = f'![SM 엔터테인먼트 제공]({uploaded_images["엑소엘_홈페이지.jpg"]["url"]})'
                print(f'✅ 라인 {i+1}: 홈페이지 이미지 수정')
            elif '목걸이' in line or '%EB%AA%A9%EA%B1%B8%EC%9D%B4' in line:
                lines[i] = f'![EXO 초능력 목걸이 굿즈]({uploaded_images["엑소_초능력_목걸이.jpg"]["url"]})'
                print(f'✅ 라인 {i+1}: 목걸이 이미지 수정')
            elif '6.23.40' in line:
                lines[i] = f'![SM 엔터테인먼트 제공]({uploaded_images["스크린샷_2025-03-30_오후_6.23.40.png"]["url"]})'
                print(f'✅ 라인 {i+1}: Overdose 이미지 수정')
            elif '엑소_오브' in line or '%EC%98%A4%EB%B8%8C' in line:
                lines[i] = f'![SM 엔터테인먼트 제공]({uploaded_images["엑소_오브.png"]["url"]})'
                print(f'✅ 라인 {i+1}: Obsession 이미지 수정')
            elif '10.09.05' in line or 'PathcodeEXO' in line:
                lines[i] = f'![SM 엔터테인먼트 제공, X @PathcodeEXO]({uploaded_images["스크린샷_2025-03-30_오후_10.09.05.png"]["url"]})'
                print(f'✅ 라인 {i+1}: Pathcode 이미지 수정')
            elif '10.40.00' in line:
                lines[i] = f'![SM 엔터테인먼트 제공]({uploaded_images["스크린샷_2025-03-30_오후_10.40.00.png"]["url"]})'
                print(f'✅ 라인 {i+1}: Tempo 이미지 수정')
            elif 'image 1' in line or 'image%201' in line:
                lines[i] = f'![EXO 앨범 판매량 추이]({uploaded_images["image 1.png"]["url"]})'
                print(f'✅ 라인 {i+1}: 판매량 이미지 수정')

# Remove 4+ leading spaces from remaining text lines
fixed_count = 0
for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Skip if already fixed (image line)
    if '![' in line and 'supabase' in line:
        continue

    # Remove 4 leading spaces
    if leading_spaces == 4 and line.strip():
        lines[i] = line[4:]
        fixed_count += 1

content = '\n'.join(lines)

print(f'\n✅ {fixed_count}개 라인의 leading spaces 제거')

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 13).execute()
    print('✅ Article 13 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
