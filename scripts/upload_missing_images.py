#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from PIL import Image
import io

# Supabase 클라이언트 설정
sys.path.insert(0, str(Path.home() / 'Library/Python/3.9/lib/python/site-packages'))

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("필요한 패키지를 설치합니다...")
    os.system('pip3 install supabase python-dotenv pillow --user')
    from supabase import create_client, Client
    from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

MAX_WIDTH = 800

# 폴더 경로
with open('/tmp/article10_path.txt', 'r') as f:
    article_folder = f.read().strip()

# 업로드할 이미지
missing_images = [
    {'file': 'f(x)-4_Walls.jpg', 'storage': '10-fx-4walls.jpg', 'caption': 'f(x) 4 Walls 앨범'},
    {'file': 'd9gym8q-18b2d293-c1c8-467a-a9de-28b35be6c435.jpg', 'storage': '10-fx-4walls-concept.jpg', 'caption': 'f(x) 4 Walls 콘셉트'},
    {'file': 'd8wvxie-9982dcc7-a2ce-4037-9b8a-0b402ab58fe5.jpg', 'storage': '10-exo-mama-logo.jpg', 'caption': 'EXO MAMA 로고'},
    {'file': 'SFSy47Rc5tQiS-aKtzmjxw0KelP4N-vroZW5tyxrhN9oZ8ZY10oqwFzt1oRgsWeU76YSOfZu3dbCI6OnXQsuURuToVlGsnKSPkI5UNZxe4VLEKiqgLfZ6Q6sbM6vaF4xUT8rjS8hGI1JYHhqu9W3QQ.png', 'storage': '10-exo-overdose-logo.png', 'caption': 'EXO Overdose 미로 로고'}
]

print('📝 [10] 누락된 이미지 업로드 중...\n')

for img in missing_images:
    file_path = os.path.join(article_folder, img['file'])

    if not os.path.exists(file_path):
        print(f"⚠️  {img['file']} 파일을 찾을 수 없습니다.")
        continue

    # 이미지 로드 및 크기 조정
    with Image.open(file_path) as image:
        width, height = image.size

        if width > MAX_WIDTH:
            new_height = int(height * (MAX_WIDTH / width))
            image = image.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            print(f"  📐 {img['file']} 크기 조정: {width}px → {MAX_WIDTH}px")

        # 버퍼에 저장
        buffer = io.BytesIO()
        format = 'PNG' if img['storage'].endswith('.png') else 'JPEG'
        image.save(buffer, format=format, quality=85, optimize=True)
        buffer.seek(0)

        # 업로드
        storage_path = f"body-images/{img['storage']}"

        try:
            supabase.storage.from_('article-images').upload(
                storage_path,
                buffer.read(),
                {'upsert': 'true', 'content-type': f'image/{format.lower()}'}
            )
            print(f"✅ {img['file']} → {img['storage']}")
        except Exception as e:
            print(f"❌ {img['file']} 업로드 실패: {e}")

# 기존 이미지들도 크기 조정
print('\n📐 기존 이미지 크기 조정 중...\n')

existing_images = [
    '10-fx-albums.png',
    '10-fx-pink-tape.jpg',
    '10-fx-art-film-1.jpg',
    '10-fx-art-film-2.jpg',
    '10-fx-art-film-3.jpg',
    '10-exo-monster-logo.png',
    '10-exo-lucky-one-logo.png',
    '10-nct-starbucks.jpg'
]

for storage_name in existing_images:
    storage_path = f"body-images/{storage_name}"

    try:
        # 다운로드
        res = supabase.storage.from_('article-images').download(storage_path)

        # 이미지 로드
        image = Image.open(io.BytesIO(res))
        width, height = image.size

        if width > MAX_WIDTH:
            new_height = int(height * (MAX_WIDTH / width))
            image = image.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
            print(f"  📐 {storage_name} 크기 조정: {width}px → {MAX_WIDTH}px")

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
            print(f"✅ {storage_name} 크기 조정 완료")
        else:
            print(f"⏭️  {storage_name} 이미 적절한 크기 ({width}px)")
    except Exception as e:
        print(f"⚠️  {storage_name} 처리 실패: {e}")

print('\n✅ 모든 이미지 업로드 및 크기 조정 완료!')
