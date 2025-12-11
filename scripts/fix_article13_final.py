#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [13] Article 13 최종 이미지 수정 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

# Replace all local paths with Supabase URLs
replacements = [
    {
        'old': 'EXO%EB%A5%BC%20%ED%95%B4%EC%84%9D%ED%95%98%EB%9D%BC,%20%EC%84%B8%EA%B3%84%EA%B4%80%EC%9D%B4%20%EB%A7%8C%EB%93%A0%20%EB%B0%80%EB%A6%AC%EC%96%B8%EC%85%80%EB%9F%AC/%E1%84%8B%E1%85%A6%E1%86%A8%E1%84%89%E1%85%A9_%E1%84%86%E1%85%A1%E1%84%86%E1%85%A1.webp',
        'new': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-mama.webp',
        'name': 'MAMA'
    },
    {
        'old': 'EXO%EB%A5%BC%20%ED%95%B4%EC%84%9D%ED%95%98%EB%9D%BC,%20%EC%84%B8%EA%B3%84%EA%B4%80%EC%9D%B4%20%EB%A7%8C%EB%93%A0%20%EB%B0%80%EB%A6%AC%EC%96%B8%EC%85%80%EB%9F%AC/%E1%84%8B%E1%85%A6%E1%86%A8%E1%84%89%E1%85%A9_%E1%84%8E%E1%85%A9%E1%84%82%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A7%E1%86%A8.webp',
        'new': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-superpowers.webp',
        'name': '초능력'
    },
    {
        'old': 'EXO%EB%A5%BC%20%ED%95%B4%EC%84%9D%ED%95%98%EB%9D%BC,%20%EC%84%B8%EA%B3%84%EA%B4%80%EC%9D%B4%20%EB%A7%8C%EB%93%A0%20%EB%B0%80%EB%A6%AC%EC%96%B8%EC%85%80%EB%9F%AC/%E1%84%8B%E1%85%A6%E1%86%A8%E1%84%89%E1%85%A9%E1%84%8B%E1%85%A6%E1%86%AF_%E1%84%92%E1%85%A9%E1%86%B7%E1%84%91%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%8C%E1%85%B5.jpg',
        'new': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exol-homepage.jpg',
        'name': 'EXO-L 홈페이지'
    },
    {
        'old': 'EXO%EB%A5%BC%20%ED%95%B4%EC%84%9D%ED%95%98%EB%9D%BC,%20%EC%84%B8%EA%B3%84%EA%B4%80%EC%9D%B4%20%EB%A7%8C%EB%93%A0%20%EB%B0%80%EB%A6%AC%EC%96%B8%EC%85%80%EB%9F%AC/%E1%84%8B%E1%85%A6%E1%86%A8%E1%84%89%E1%85%A9_%E1%84%8E%E1%85%A9%E1%84%82%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A7%E1%86%A8_%E1%84%86%E1%85%A9%E1%86%A8%E1%84%80%E1%85%A5%E1%86%AF%E1%84%8B%E1%85%B5.jpg',
        'new': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-necklace.jpg',
        'name': '목걸이'
    },
    {
        'old': 'EXO%EB%A5%BC%20%ED%95%B4%EC%84%9D%ED%95%98%EB%9D%BC,%20%EC%84%B8%EA%B3%84%EA%B4%80%EC%9D%B4%20%EB%A7%8C%EB%93%A0%20%EB%B0%80%EB%A6%AC%EC%96%B8%EC%85%80%EB%9F%AC/%E1%84%8B%E1%85%A6%E1%86%A8%E1%84%89%E1%85%A9_%E1%84%8B%E1%85%A9%E1%84%87%E1%85%B3.png',
        'new': 'https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/13-exo-obsession.png',
        'name': 'Obsession'
    },
]

for replacement in replacements:
    if replacement['old'] in content:
        content = content.replace(replacement['old'], replacement['new'])
        print(f'✅ {replacement["name"]} 이미지 URL 교체')

# Update caption for necklace image
content = content.replace('![엑소 초능력 목걸이.jpg]', '![EXO 초능력 목걸이 굿즈]')
print(f'✅ 목걸이 캡션 수정')

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 13).execute()
    print('✅ Article 13 최종 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
