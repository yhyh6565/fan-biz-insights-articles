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

print('📝 [16] Article 16 수정 중...\n')

# 1. Get folder path
with open('/tmp/article16_dir.txt', 'r') as f:
    dir_name = f.read().strip()

article_folder = f'/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/{dir_name}'

# 2. Upload images
images_to_upload = [
    {'file': 'image.png', 'storage': '16-smcu-express.png', 'caption': 'SM 제공. 〈2021 Winter SMTOWN : SMCU EXPRESS〉 디지털 커버'},
    {'file': 'image 1.png', 'storage': '16-superm.png', 'caption': 'Variety 제공. 그룹 \'SuperM\''},
    {'file': 'image 2.png', 'storage': '16-smtown-world-tour.png', 'caption': 'SM 제공. <SMTOWN LIVE WORLD TOUR III>'},
    {'file': 'image 3.png', 'storage': '16-smtown-2025.png', 'caption': 'SM 제공. <SMTOWN LIVE 2025>'},
    {'file': 'LXZrl9.jpg', 'storage': '16-timecapsule.jpg', 'caption': 'SM 제공. 《2025 SMTOWN: THE CULTURE, THE FUTURE》 타임캡슐 버전'},
    {'file': '0407ceed-d4e8-4e19-8b8e-5a52fd3a9948.png', 'storage': '16-mp3-player.png', 'caption': 'SM 제공. 30주년 콘서트 MD인 MP3 플레이어'},
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

response = supabase.table('articles').select('content').eq('article_number', 16).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix images - replace with uploaded URLs and remove leading spaces
for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        # Remove leading spaces for image lines
        lines[i] = line.lstrip()

        # Replace with Supabase URL based on file pattern
        if 'image.png' in line and 'image 1' not in line and 'image 2' not in line and 'image 3' not in line:
            lines[i] = f'![SM 제공. 〈2021 Winter SMTOWN : SMCU EXPRESS〉 디지털 커버]({uploaded_images["image.png"]["url"]})'
            print(f'✅ 라인 {i+1}: SMCU EXPRESS 이미지 수정')
        elif 'image 1' in line or 'image%201' in line:
            lines[i] = f'![Variety 제공. 그룹 \'SuperM\']({uploaded_images["image 1.png"]["url"]})'
            print(f'✅ 라인 {i+1}: SuperM 이미지 수정')
        elif 'image 2' in line or 'image%202' in line:
            lines[i] = f'![SM 제공. <SMTOWN LIVE WORLD TOUR III>]({uploaded_images["image 2.png"]["url"]})'
            print(f'✅ 라인 {i+1}: WORLD TOUR III 이미지 수정')
        elif 'image 3' in line or 'image%203' in line:
            lines[i] = f'![SM 제공. <SMTOWN LIVE 2025>]({uploaded_images["image 3.png"]["url"]})'
            print(f'✅ 라인 {i+1}: SMTOWN LIVE 2025 이미지 수정')
        elif 'LXZrl9' in line:
            lines[i] = f'![SM 제공. 《2025 SMTOWN: THE CULTURE, THE FUTURE》 타임캡슐 버전]({uploaded_images["LXZrl9.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 타임캡슐 이미지 수정')
        elif '0407ceed' in line:
            lines[i] = f'![SM 제공. 30주년 콘서트 MD인 MP3 플레이어]({uploaded_images["0407ceed-d4e8-4e19-8b8e-5a52fd3a9948.png"]["url"]})'
            print(f'✅ 라인 {i+1}: MP3 플레이어 이미지 수정')

content = '\n'.join(lines)

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 16).execute()
    print('✅ Article 16 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
