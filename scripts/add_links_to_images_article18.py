#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 18 이미지에 하이퍼링크 추가 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 18).single().execute()
content = response.data['content']

lines = content.split('\n')

# Define images that need hyperlinks
# Format: {pattern: link_url}
image_links = {
    '이투데이': 'https://www.etoday.co.kr/news/view/1055157',
    '연합뉴스': 'https://www.yna.co.kr/view/AKR20150113162000005',
    '주간동아': 'https://weekly.donga.com/economy/article/all/11/1339359/1',
    '강남구청 페이스북': 'https://www.facebook.com/gnfamily/posts/%EC%BD%94%EC%97%91%EC%8A%A4%EC%97%90%EC%84%9C-%EB%B4%89%EC%9D%80%EC%82%AC%EB%A1%9C-%EA%B0%80%EB%8A%94-%EA%B8%B8%EC%97%90-sm%ED%83%80%EC%9A%B4-%EC%BD%94%EC%97%91%EC%8A%A4-%EC%95%84%ED%8B%B0%EC%9B%80%EC%9D%84-%EC%A7%80%EB%82%AC%EB%8A%94%EB%8D%B0%EC%9A%94-%EA%B1%B4%EB%AC%BC-%EC%95%9E%EC%97%90-%EB%84%88%EB%AC%B4-%EA%B7%80%EC%97%AC%EC%9A%B4-%EC%97%91%EC%86%8C-%ED%94%BC%EA%B7%9C%EC%96%B4%EB%93%A4%EC%9D%B4-%EC%A0%84%EC%8B%9C%EB%90%98%EC%96%B4-%EC%9E%88%EC%96%B4%EC%9A%94%ED%8C%AC%EC%9D%80-%EC%95%84%EB%8B%88%EC%A7%80%EB%A7%8C-%EA%B7%B8%EB%9E%98%EB%8F%84-%EB%84%88/1057740794238830/'
}

# Wrap images with links
for i, line in enumerate(lines):
    if line.strip().startswith('![') and '](' in line:
        # Check if this image should have a link
        for pattern, link_url in image_links.items():
            if pattern in line:
                # Extract the full image markdown
                image_md = line.strip()

                # Wrap it with a link: [![caption](url)](link)
                # Format: [![caption](image_url)](link_url)
                linked_image = f'[{image_md}]({link_url})'
                lines[i] = linked_image

                print(f'✅ 라인 {i+1}: "{pattern}" 이미지에 링크 추가')
                print(f'   링크: {link_url[:80]}...')
                break

content = '\n'.join(lines)

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 18).execute()
    print('✅ Article 18 이미지 하이퍼링크 추가 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
