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

print('📝 [17] Article 17 수정 중...\n')

# 1. Get folder path
with open('/tmp/article17_dir.txt', 'r') as f:
    dir_name = f.read().strip()

article_folder = f'/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/{dir_name}'

# 2. Upload images
images_to_upload = [
    {'file': 'SMTOWN-LIVE-2025-서울-콘서트-단체-이미지.jpg', 'storage': '17-smtown-live-2025-group.jpg', 'caption': 'SM 제공, SMTOWN Live 2025 단체 사진'},
    {'file': 'image.png', 'storage': '17-beyond-super-show.png', 'caption': '레이블SJ 제공, 온라인 유료 콘서트 \'Beyond the SUPER SHOW\''},
    {'file': 'image 1.png', 'storage': '17-sm-concert-revenue.png', 'caption': '아시아경제 제공. 4Q24 SM 콘서트 매출'},
    {'file': 'image 2.png', 'storage': '17-superm-billboard.png', 'caption': '[한국일보](https://www.hankookilbo.com/News/Read/201910141081095428) 제공, SuperM 빌보드 200 1위 달성'},
    {'file': 'image 3.png', 'storage': '17-bubble-revenue.png', 'caption': '[매일경제](https://www.mk.co.kr/economy/view.php?sc=50000001&year=2024&no=87022) 제공, 디어유 \'버블\' 실적 추이'},
]

uploaded_images = {}

for img in images_to_upload:
    image_path = os.path.join(article_folder, img['file'])
    storage_name = img['storage']

    print(f'📤 이미지 업로드 중: {storage_name}')

    try:
        # Load and optimize image
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
            print(f'  원본 크기: {width}x{height}')

            # Resize if needed (max width 800px)
            MAX_WIDTH = 800
            if width > MAX_WIDTH:
                new_height = int(height * (MAX_WIDTH / width))
                image = image.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                print(f'  리사이즈: {MAX_WIDTH}x{new_height}')

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

response = supabase.table('articles').select('content').eq('article_number', 17).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix images - replace with uploaded URLs and remove leading spaces
for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        # Remove leading spaces for image lines
        lines[i] = line.lstrip()

        # Replace with Supabase URL based on file pattern
        if 'SMTOWN-LIVE-2025' in line or '서울-콘서트-단체' in line:
            lines[i] = f'![SM 제공, SMTOWN Live 2025 단체 사진]({uploaded_images["SMTOWN-LIVE-2025-서울-콘서트-단체-이미지.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: SMTOWN Live 2025 단체 사진 수정')
        elif 'image.png' in line and 'image 1' not in line and 'image 2' not in line and 'image 3' not in line:
            lines[i] = f'![레이블SJ 제공, 온라인 유료 콘서트 \'Beyond the SUPER SHOW\']({uploaded_images["image.png"]["url"]})'
            print(f'✅ 라인 {i+1}: Beyond the SUPER SHOW 이미지 수정')
        elif 'image 1' in line or 'image%201' in line:
            lines[i] = f'![아시아경제 제공. 4Q24 SM 콘서트 매출]({uploaded_images["image 1.png"]["url"]})'
            print(f'✅ 라인 {i+1}: SM 콘서트 매출 이미지 수정')
        elif 'image 2' in line or 'image%202' in line:
            lines[i] = f'![[한국일보](https://www.hankookilbo.com/News/Read/201910141081095428) 제공, SuperM 빌보드 200 1위 달성]({uploaded_images["image 2.png"]["url"]})'
            print(f'✅ 라인 {i+1}: SuperM 빌보드 이미지 수정')
        elif 'image 3' in line or 'image%203' in line:
            lines[i] = f'![[매일경제](https://www.mk.co.kr/economy/view.php?sc=50000001&year=2024&no=87022) 제공, 디어유 \'버블\' 실적 추이]({uploaded_images["image 3.png"]["url"]})'
            print(f'✅ 라인 {i+1}: 버블 실적 추이 이미지 수정')

# Fix leading spaces
fixed_count = 0
for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Skip image lines with supabase
    if '![' in line and 'supabase' in line:
        continue

    # Change 4 spaces to 2 spaces
    if leading_spaces == 4 and line.strip():
        lines[i] = '  ' + line.lstrip()
        fixed_count += 1

content = '\n'.join(lines)

if fixed_count > 0:
    print(f'\n✅ {fixed_count}개 라인의 leading spaces 수정 (4→2)')

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 17).execute()
    print('✅ Article 17 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
