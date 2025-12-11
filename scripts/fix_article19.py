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

print('📝 [19] Article 19 수정 중...\n')

# 1. Article folder
article_folder = '/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/수백만이 다녀갔지만 적자였던 아티움, 짧게 열고 다 팔아버린 팝업'

# 2. Upload images
images_to_upload = [
    {'file': '317d5288-1d27-491f-b5d7-0b26f9e07de7.jpg', 'storage': '19-aespa-popup-object.jpg'},
    {'file': '20249079171792983920.jpg', 'storage': '19-aespa-y2k-popup.jpg'},
    {'file': 'xJrip2PEHl7d69c3e15c924777a1f5bfbb6a775b08nmwIcUkLTt1q03ecid.zsw.jpg', 'storage': '19-nct127-bumpercar.jpg'},
    {'file': 'ba95b2af-0831-4a0b-a531-42bf1a840f97.png', 'storage': '19-kwangya-everland.png'},
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

            uploaded_images[img['file']] = public_url

    except Exception as e:
        print(f'❌ 이미지 업로드 실패: {e}\n')

# 3. Get content and fix images
print('📝 Content 수정 중...\n')

response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

# Replace image paths with Supabase URLs
# DB에는 URL 인코딩된 경로가 저장되어 있음
lines = content.split('\n')
replaced_count = 0

for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        # Replace URL-encoded paths
        if '317d5288-1d27-491f-b5d7-0b26f9e07de7.jpg' in line:
            # Extract alt text and replace URL
            if uploaded_images.get('317d5288-1d27-491f-b5d7-0b26f9e07de7.jpg'):
                # Keep the alt text, replace the URL
                alt_start = line.find('![') + 2
                alt_end = line.find('](')
                url_start = alt_end + 2
                url_end = line.find(')', url_start)

                alt_text = line[alt_start:alt_end]
                new_line = f'![{alt_text}]({uploaded_images["317d5288-1d27-491f-b5d7-0b26f9e07de7.jpg"]})'
                lines[i] = new_line
                replaced_count += 1
                print(f'✅ Line {i+1}: aespa 오브제 이미지 교체')

        elif '20249079171792983920.jpg' in line:
            if uploaded_images.get('20249079171792983920.jpg'):
                alt_start = line.find('![') + 2
                alt_end = line.find('](')
                alt_text = line[alt_start:alt_end]
                new_line = f'![{alt_text}]({uploaded_images["20249079171792983920.jpg"]})'
                lines[i] = new_line
                replaced_count += 1
                print(f'✅ Line {i+1}: aespa Y2K 이미지 교체')

        elif 'xJrip2PEHl7d69c3e15c924777a1f5bfbb6a775b08nmwIcUkLTt1q03ecid.zsw.jpg' in line:
            if uploaded_images.get('xJrip2PEHl7d69c3e15c924777a1f5bfbb6a775b08nmwIcUkLTt1q03ecid.zsw.jpg'):
                alt_start = line.find('![') + 2
                alt_end = line.find('](')
                alt_text = line[alt_start:alt_end]
                new_line = f'![{alt_text}]({uploaded_images["xJrip2PEHl7d69c3e15c924777a1f5bfbb6a775b08nmwIcUkLTt1q03ecid.zsw.jpg"]})'
                lines[i] = new_line
                replaced_count += 1
                print(f'✅ Line {i+1}: NCT127 범퍼카 이미지 교체')

        elif 'ba95b2af-0831-4a0b-a531-42bf1a840f97.png' in line:
            if uploaded_images.get('ba95b2af-0831-4a0b-a531-42bf1a840f97.png'):
                alt_start = line.find('![') + 2
                alt_end = line.find('](')
                alt_text = line[alt_start:alt_end]
                new_line = f'![{alt_text}]({uploaded_images["ba95b2af-0831-4a0b-a531-42bf1a840f97.png"]})'
                lines[i] = new_line
                replaced_count += 1
                print(f'✅ Line {i+1}: KWANGYA@EVERLAND 이미지 교체')

content = '\n'.join(lines)
print(f'\n총 {replaced_count}개 이미지 경로 교체 완료')

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 19).execute()
    print('✅ Article 19 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
