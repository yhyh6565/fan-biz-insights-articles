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

print('📝 [18] Article 18 수정 중...\n')

# 1. Get folder path
with open('/tmp/article18_dir.txt', 'r') as f:
    dir_name = f.read().strip()

article_folder = f'/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/{dir_name}'

# 2. Upload images
images_to_upload = [
    {'file': 'image.png', 'storage': '18-artium-entrance.png', 'caption': 'SM 제공. SMTOWN@코엑스아티움 입구'},
    {'file': '20150114075632_571901_520_347.jpg', 'storage': '18-sum-store.jpg', 'caption': '[이투데이](https://www.etoday.co.kr/news/view/1055157) 제공. 2층 SUM 스토어'},
    {'file': 'image 1.png', 'storage': '18-smtown-studio.png', 'caption': 'SM 제공. SMTOWN Studio'},
    {'file': 'image 2.png', 'storage': '18-liverary-cafe.png', 'caption': '[연합뉴스](https://www.yna.co.kr/view/AKR20150113162000005) 제공. LIVErary CAFE'},
    {'file': 'SMTOWNTHEATREAdmissionTicketSeoulKorea-KlookUnitedStates.jpg', 'storage': '18-smtown-theatre.jpg', 'caption': 'Klook 제공. SMTOWN Theatre'},
    {'file': '5b10aa4920b6d2738de6.jpg', 'storage': '18-handprints-trophy.jpg', 'caption': '[주간동아](https://weekly.donga.com/economy/article/all/11/1339359/1) 제공. 아티스트 손바닥 자국(위), 연말시상식 트로피(아래)'},
    {'file': 'museum-of-snsd.jpg', 'storage': '18-snsd-museum.jpg', 'caption': 'Tripadvisor 제공.'},
    {'file': '465435276_9088217354524427_675679864117396696_n.jpg', 'storage': '18-exo-figures.jpg', 'caption': '[강남구청 페이스북](...) 제공. 포토존으로 세워진 엑소 피규어'},
    {'file': '681bd9c5-136a-4c78-85a4-1bc80808efd9.jpg', 'storage': '18-tourism-spot.jpg', 'caption': '강남구청 제공. 코엑스와 함께 대표 관광지로 소개된 SMTOWN 아티움'},
    {'file': '308288_309294_599.jpg', 'storage': '18-closing-notice.jpg', 'caption': 'SM 제공. SMTOWN 코엑스 아티움 영업 종료 안내.'},
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

response = supabase.table('articles').select('content').eq('article_number', 18).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix images - replace with uploaded URLs and remove leading spaces
for i, line in enumerate(lines):
    if '![' in line and '](' in line:
        # Remove leading spaces for image lines
        lines[i] = line.lstrip()

        # Replace with Supabase URL based on file pattern
        if 'image.png' in line and 'image 1' not in line and 'image 2' not in line:
            lines[i] = f'![SM 제공. SMTOWN@코엑스아티움 입구]({uploaded_images["image.png"]["url"]})'
            print(f'✅ 라인 {i+1}: 아티움 입구 이미지 수정')
        elif '20150114075632' in line:
            lines[i] = f'![[이투데이](https://www.etoday.co.kr/news/view/1055157) 제공. 2층 SUM 스토어]({uploaded_images["20150114075632_571901_520_347.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: SUM 스토어 이미지 수정')
        elif 'image 1' in line or 'image%201' in line:
            lines[i] = f'![SM 제공. SMTOWN Studio]({uploaded_images["image 1.png"]["url"]})'
            print(f'✅ 라인 {i+1}: SMTOWN Studio 이미지 수정')
        elif 'image 2' in line or 'image%202' in line:
            lines[i] = f'![[연합뉴스](https://www.yna.co.kr/view/AKR20150113162000005) 제공. LIVErary CAFE]({uploaded_images["image 2.png"]["url"]})'
            print(f'✅ 라인 {i+1}: LIVErary CAFE 이미지 수정')
        elif 'SMTOWNTHEATREAdmissionTicket' in line or 'Klook' in line:
            lines[i] = f'![Klook 제공. SMTOWN Theatre]({uploaded_images["SMTOWNTHEATREAdmissionTicketSeoulKorea-KlookUnitedStates.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: SMTOWN Theatre 이미지 수정')
        elif '5b10aa4920b6d2738de6' in line:
            lines[i] = f'![[주간동아](https://weekly.donga.com/economy/article/all/11/1339359/1) 제공. 아티스트 손바닥 자국(위), 연말시상식 트로피(아래)]({uploaded_images["5b10aa4920b6d2738de6.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 손바닥 자국/트로피 이미지 수정')
        elif 'museum-of-snsd' in line:
            lines[i] = f'![Tripadvisor 제공.]({uploaded_images["museum-of-snsd.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: SNSD 박물관 이미지 수정')
        elif '465435276' in line or '엑소 피규어' in line:
            # Keep the Facebook link intact in the caption
            fb_link = 'https://www.facebook.com/gnfamily/posts/%EC%BD%94%EC%97%91%EC%8A%A4%EC%97%90%EC%84%9C-%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C-%EA%B0%80%EB%8A%94-%EA%B8%B8%EC%97%90-sm%ED%83%80%EC%9A%B4-%EC%BD%94%EC%97%91%EC%8A%A4-%EC%95%84%ED%8B%B0%EC%9B%80%EC%9D%84-%EC%A7%80%EB%82%AC%EB%8A%94%EB%8D%B0%EC%9A%94-%EA%B1%B4%EB%AC%BC-%EC%95%9E%EC%97%90-%EB%84%88%EB%AC%B4-%EA%B7%80%EC%97%AC%EC%9A%B4-%EC%97%91%EC%86%8C-%ED%94%BC%EA%B7%9C%EC%96%B4%EB%93%A4%EC%9D%B4-%EC%A0%84%EC%8B%9C%EB%90%98%EC%96%B4-%EC%9E%88%EC%96%B4%EC%9A%94%ED%8C%AC%EC%9D%80-%EC%95%84%EB%8B%88%EC%A7%80%EB%A7%8C-%EA%B7%B8%EB%9E%98%EB%8F%84-%EB%84%88/1057740794238830/'
            lines[i] = f'![[강남구청 페이스북]({fb_link}) 제공. 포토존으로 세워진 엑소 피규어]({uploaded_images["465435276_9088217354524427_675679864117396696_n.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 엑소 피규어 이미지 수정')
        elif '681bd9c5' in line:
            lines[i] = f'![강남구청 제공. 코엑스와 함께 대표 관광지로 소개된 SMTOWN 아티움]({uploaded_images["681bd9c5-136a-4c78-85a4-1bc80808efd9.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 관광지 소개 이미지 수정')
        elif '308288_309294_599' in line:
            lines[i] = f'![SM 제공. SMTOWN 코엑스 아티움 영업 종료 안내.]({uploaded_images["308288_309294_599.jpg"]["url"]})'
            print(f'✅ 라인 {i+1}: 영업 종료 안내 이미지 수정')

# Fix leading spaces (중복 캡션 텍스트) - 4칸 들여쓰기는 삭제
lines_to_remove = []
for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())
    stripped = line.strip()

    # 4칸 들여쓰기이면서 이미지 캡션과 중복되는 텍스트인 경우 삭제
    if leading_spaces == 4 and stripped and not stripped.startswith('!['):
        # Check if this looks like a duplicate caption (contains 제공)
        if '제공' in stripped or 'Tripadvisor' in stripped:
            lines_to_remove.append(i)

# Remove duplicate caption lines
new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
content = '\n'.join(new_lines)

if lines_to_remove:
    print(f'\n✅ {len(lines_to_remove)}개 중복 캡션 라인 삭제')

# 4. Update database
print('\n💾 데이터베이스 업데이트 중...')

try:
    supabase.table('articles').update({'content': content}).eq('article_number', 18).execute()
    print('✅ Article 18 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
