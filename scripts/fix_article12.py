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

print('📝 [12] Article 12 수정 중...\n')

# 1. Get folder path
with open('/tmp/article12_path.txt', 'r') as f:
    article_folder = f.read().strip()

# 2. Upload images
images_to_upload = [
    {'file': '아이소이.jpg', 'storage': '12-aisoi.jpg', 'caption': '아이소이 제공'},
    {'file': '빙그레.jpg', 'storage': '12-binggrae.jpg', 'caption': '빙그레 제공'}
]

uploaded_images = []

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
            image.save(buffer, format='JPEG', quality=85, optimize=True)
            buffer.seek(0)

            # Upload to Supabase
            storage_path = f'body-images/{storage_name}'
            supabase.storage.from_('article-images').upload(
                storage_path,
                buffer.read(),
                {'upsert': 'true', 'content-type': 'image/jpeg'}
            )

            # Get public URL
            public_url = supabase.storage.from_('article-images').get_public_url(storage_path)
            print(f'✅ 업로드 완료: {public_url}\n')

            uploaded_images.append({
                'caption': img['caption'],
                'url': public_url
            })

    except Exception as e:
        print(f'❌ 이미지 업로드 실패: {e}')

# 3. Get content and fix issues
print('📝 Content 수정 중...\n')

response = supabase.table('articles').select('content').eq('article_number', 12).single().execute()
content = response.data['content']

# Fix images and captions
lines = content.split('\n')

# Replace images with uploaded URLs
for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Fix image lines with 4 leading spaces
    if leading_spaces == 4 and line.strip().startswith('![') and ('아이소이' in line or '빙그레' in line):
        if '아이소이' in line:
            lines[i] = f'![아이소이 제공]({uploaded_images[0]["url"]})'
            print(f'✅ 라인 {i+1}: 아이소이 이미지 수정')
        elif '빙그레' in line:
            lines[i] = f'![빙그레 제공]({uploaded_images[1]["url"]})'
            print(f'✅ 라인 {i+1}: 빙그레 이미지 수정')

# Remove 4 leading spaces from all remaining lines (except images we just fixed)
fixed_count = 0
for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Skip if it's an image we already processed
    if '![' in line and 'supabase' in line:
        continue

    # Remove 4 leading spaces
    if leading_spaces == 4 and line.strip():
        lines[i] = line[4:]
        fixed_count += 1
        print(f'✅ 라인 {i+1}: leading spaces 제거')

content = '\n'.join(lines)

print(f'\n✅ 총 {fixed_count}개 라인의 leading spaces 제거')

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 12).execute()
    print('✅ Article 12 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
