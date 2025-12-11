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

print('📝 [14] Article 14 수정 중...\n')

# 1. Get folder path
with open('/tmp/article14_path.txt', 'r') as f:
    article_folder = f.read().strip()

# 2. Upload images
images_to_upload = [
    {'file': 'Marvel_Cinematic_Universe_logo.png.webp', 'storage': '14-mcu-logo.webp', 'caption': '마블 제공'},
    {'file': 'fine-ill-do-it-myself-v0-ng525uxzoc2c1.webp', 'storage': '14-thanos-postcredit.webp', 'caption': 'Reddit 제공. <가디언즈 오브 갤럭시>의 포스트 크레딧 장면'},
    {'file': 'Avengers_Endgame_poster.jpg', 'storage': '14-endgame-poster.jpg', 'caption': '마블 제공'},
    {'file': '485132946_665074426463820_4057552292023143723_n.jpg', 'storage': '14-endgame-scenes.jpg', 'caption': '마블 제공. <어벤져스: 엔드게임>(2019)에서 재방문한 과거 장면들'},
    {'file': 'maxresdefault.jpg', 'storage': '14-newyork-battle.jpg', 'caption': '마블 제공. <어벤져스: 엔드게임>(2019)에서 재방문한 뉴욕 전투 장면'},
    {'file': 'image.png', 'storage': '14-cap-hammer1.png', 'caption': '마블 제공. <어벤져스: 에이지 오브 울트론> 당시 \'살짝\' 묠니르를 들어올린 캡틴 아메리카'},
    {'file': 'avengers-endgame-captain-america-thor-hammer.webp', 'storage': '14-cap-hammer2.webp', 'caption': '마블 제공. <어벤져스: 엔드게임> 당시 결국 묠니르를 들어올린 캡틴 아메리카'},
    {'file': '스크린샷_2025-04-09_오후_6.18.15.png', 'storage': '14-i-am-ironman.png', 'caption': 'Reddit 제공. <아이언맨 1>(위), <어벤져스: 엔드게임>(아래)에서의 "I am Ironman"'},
    {'file': 'Disney_California_Adventure_(51242299125).jpg', 'storage': '14-avengers-campus.jpg', 'caption': 'Disney California Adventure 제공. MCU를 테마로 한 \'Avengers Campus\' 테마파크'},
    {'file': 'ugg6a3ka5qi91.jpg', 'storage': '14-mcu-timeline.jpg', 'caption': 'Reddit 제공. 2022년 기준 MCU 영화 및 드라마 순서'},
]

uploaded_images = {}

for img in images_to_upload:
    image_path = os.path.join(article_folder, img['file'])
    storage_name = img['storage']

    print(f'📤 이미지 업로드 중: {storage_name}')

    try:
        # Load and optimize image
        with Image.open(image_path) as image:
            # Convert AVIF or other formats to RGB if needed
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

response = supabase.table('articles').select('content').eq('article_number', 14).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix images - replace with uploaded URLs and remove leading spaces
for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        # Remove leading spaces for image lines
        lines[i] = line.lstrip()

        # Replace with Supabase URL based on file pattern
        if 'Marvel_Cinematic_Universe_logo.png.webp' in line:
            lines[i] = f'![마블 제공]({uploaded_images["Marvel_Cinematic_Universe_logo.png.webp"]["url"]})'
            print(f'✅ 라인 {i+1}: MCU 로고 이미지 수정')
        elif 'fine-ill-do-it-myself' in line:
            lines[i] = f'![Reddit 제공. <가디언즈 오브 갤럭시>의 포스트 크레딧 장면]({uploaded_images["fine-ill-do-it-myself-v0-ng525uxzoc2c1.webp"]["url"]})'
            print(f'✅ 라인 {i+1}: 타노스 포스트 크레딧 이미지 수정')
        elif 'Avengers_Endgame_poster.jpg' in line:
            lines[i] = f'![마블 제공]({uploaded_images["Avengers_Endgame_poster.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 엔드게임 포스터 이미지 수정')
        elif '485132946_665074426463820' in line:
            lines[i] = f'![마블 제공. <어벤져스: 엔드게임>(2019)에서 재방문한 과거 장면들]({uploaded_images["485132946_665074426463820_4057552292023143723_n.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 엔드게임 과거 장면들 이미지 수정')
        elif 'maxresdefault.jpg' in line:
            lines[i] = f'![마블 제공. <어벤져스: 엔드게임>(2019)에서 재방문한 뉴욕 전투 장면]({uploaded_images["maxresdefault.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 뉴욕 전투 장면 이미지 수정')
        elif 'image.png' in line and '에이지 오브 울트론' in line:
            lines[i] = f'![마블 제공. <어벤져스: 에이지 오브 울트론> 당시 \'살짝\' 묠니르를 들어올린 캡틴 아메리카]({uploaded_images["image.png"]["url"]})'
            print(f'✅ 라인 {i+1}: 캡틴 아메리카 망치1 이미지 수정')
        elif 'avengers-endgame-captain-america-thor-hammer' in line:
            lines[i] = f'![마블 제공. <어벤져스: 엔드게임> 당시 결국 묠니르를 들어올린 캡틴 아메리카]({uploaded_images["avengers-endgame-captain-america-thor-hammer.webp"]["url"]})'
            print(f'✅ 라인 {i+1}: 캡틴 아메리카 망치2 이미지 수정')
        elif '6.18.15' in line or 'I am Ironman' in line:
            lines[i] = f'![Reddit 제공. <아이언맨 1>(위), <어벤져스: 엔드게임>(아래)에서의 "I am Ironman"]({uploaded_images["스크린샷_2025-04-09_오후_6.18.15.png"]["url"]})'
            print(f'✅ 라인 {i+1}: I am Ironman 이미지 수정')
        elif 'Disney_California_Adventure' in line:
            lines[i] = f'![Disney California Adventure 제공. MCU를 테마로 한 \'Avengers Campus\' 테마파크]({uploaded_images["Disney_California_Adventure_(51242299125).jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: Avengers Campus 이미지 수정')
        elif 'ugg6a3ka5qi91' in line:
            lines[i] = f'![Reddit 제공. 2022년 기준 MCU 영화 및 드라마 순서]({uploaded_images["ugg6a3ka5qi91.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: MCU 타임라인 이미지 수정')

# Remove 4+ leading spaces from remaining text lines
fixed_count = 0
for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Skip if already fixed (image line with supabase)
    if '![' in line and 'supabase' in line:
        continue

    # Change 4 spaces to 2 spaces
    if leading_spaces == 4 and line.strip():
        lines[i] = '  ' + line.lstrip()
        fixed_count += 1

content = '\n'.join(lines)

print(f'\n✅ {fixed_count}개 라인의 leading spaces 수정 (4→2)')

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 14).execute()
    print('✅ Article 14 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
