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

print('📝 [11] Article 11 수정 중...\n')

# 1. Get folder path
with open('/tmp/article11_path.txt', 'r') as f:
    article_folder = f.read().strip()

# 2. Upload image
image_path = os.path.join(article_folder, '엔시티_응원봉.jpg')
storage_name = '11-nct-lightstick.jpg'

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
        print(f'✅ 업로드 완료: {public_url}')

except Exception as e:
    print(f'❌ 이미지 업로드 실패: {e}')
    exit(1)

# 3. Get content and fix issues
print('\n📝 Content 수정 중...\n')

response = supabase.table('articles').select('content').eq('article_number', 11).single().execute()
content = response.data['content']

# Fix line 45: Remove leading spaces and update image URL
old_image_line = '    ![엔시티 응원봉.jpg](%EB%94%B0%EB%A1%9C%20%EB%98%90%20%EA%B0%99%EC%9D%B4,%204500%EB%A7%8C%20%EC%9E%A5%EC%9D%84%20%ED%8C%90%20%ED%8C%80%20\'NCT%E2%80%99/%E1%84%8B%E1%85%A6%E1%86%AB%E1%84%89%E1%85%B5%E1%84%90%E1%85%B5_%E1%84%8B%E1%85%B3%E1%86%BC%E1%84%8B%E1%85%AF%E1%86%AB%E1%84%87%E1%85%A9%E1%86%BC.jpg)'
new_image_line = f'![NCT 응원봉]({public_url})'

if old_image_line in content:
    content = content.replace(old_image_line, new_image_line)
    print(f'✅ 이미지 경로 수정')
else:
    print('⚠️  이미지 라인을 찾을 수 없음. 수동으로 수정합니다...')
    # Try to find and replace more flexibly
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if '엔시티 응원봉' in line or '엔시티_응원봉' in line:
            # Remove leading spaces
            lines[i] = new_image_line
            print(f'✅ 라인 {i+1}: 이미지 수정')
    content = '\n'.join(lines)

# Fix lines with 4+ leading spaces
lines = content.split('\n')
fixed_count = 0

for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Only fix lines with exactly 4 leading spaces (not 8, 12, etc which might be intentional indentation)
    if leading_spaces == 4 and line.strip():
        # Skip if it's already an image that we fixed
        if '![' in line and '](' in line:
            continue

        # Remove 4 leading spaces
        lines[i] = line[4:]
        fixed_count += 1
        print(f'✅ 라인 {i+1}: leading spaces 제거')

content = '\n'.join(lines)

print(f'\n✅ 총 {fixed_count}개 라인의 leading spaces 제거')

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 11).execute()
    print('✅ Article 11 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
