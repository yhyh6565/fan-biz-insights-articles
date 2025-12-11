#!/usr/bin/env python3
"""
범용 이미지 업로드 스크립트
사용법: python3 upload_article_images.py <article_number> <config_file>

예시: python3 upload_article_images.py 19 configs/article19.json
"""
import os
import sys
import json
from supabase import create_client
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

MAX_WIDTH = 800

def upload_images(article_number, config):
    """이미지 업로드 및 URL 교체"""
    article_folder = config['article_folder']
    images = config['images']

    print(f'📝 [#{article_number}] 이미지 업로드 중...\n')

    uploaded_urls = {}

    # 1. Upload images
    for img in images:
        image_path = os.path.join(article_folder, img['file'])
        storage_name = img['storage']

        if not os.path.exists(image_path):
            print(f'⚠️  {img["file"]} 파일을 찾을 수 없습니다.')
            continue

        print(f'📤 {storage_name}')

        try:
            with Image.open(image_path) as image:
                # Convert to RGB if needed
                if image.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', image.size, (255, 255, 255))
                    if image.mode == 'P':
                        image = image.convert('RGBA')
                    background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                    image = background
                elif image.mode != 'RGB':
                    image = image.convert('RGB')

                width, height = image.size

                # Resize if needed
                if width > MAX_WIDTH:
                    new_height = int(height * (MAX_WIDTH / width))
                    image = image.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                    print(f'  📐 {width}x{height} → {MAX_WIDTH}x{new_height}')

                # Save to buffer
                buffer = io.BytesIO()
                format = 'PNG' if storage_name.endswith('.png') else 'JPEG'
                if format == 'PNG':
                    image.save(buffer, format=format, optimize=True)
                else:
                    image.save(buffer, format=format, quality=85, optimize=True)
                buffer.seek(0)

                # Upload to Supabase
                storage_path = f'body-images/{storage_name}'
                content_type = f'image/{format.lower()}'

                supabase.storage.from_('article-images').upload(
                    storage_path,
                    buffer.read(),
                    {'upsert': 'true', 'content-type': content_type}
                )

                public_url = supabase.storage.from_('article-images').get_public_url(storage_path)
                uploaded_urls[img['file']] = public_url
                print(f'✅ 업로드 완료\n')

        except Exception as e:
            print(f'❌ 업로드 실패: {e}\n')

    # 2. Update content in DB
    print('📝 DB 업데이트 중...\n')

    response = supabase.table('articles').select('content').eq('article_number', article_number).single().execute()
    content = response.data['content']

    # Replace image paths
    for img in images:
        if img['file'] in uploaded_urls:
            # Find and replace in content
            for old_pattern in img.get('old_patterns', [img['file']]):
                if old_pattern in content:
                    content = content.replace(old_pattern, uploaded_urls[img['file']])
                    print(f'✅ {img["file"]} 경로 교체')

    # Update DB
    supabase.table('articles').update({'content': content}).eq('article_number', article_number).execute()
    print('\n✅ 완료!')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('사용법: python3 upload_article_images.py <article_number> <config_file>')
        sys.exit(1)

    article_number = int(sys.argv[1])
    config_file = sys.argv[2]

    with open(config_file, 'r', encoding='utf-8') as f:
        config = json.load(f)

    upload_images(article_number, config)
