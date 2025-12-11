#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [19] Article 19 최종 수정 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

lines = content.split('\n')

# Fix specific problematic lines
for i, line in enumerate(lines):
    # Line 41: Korea JoongAng Daily image
    if '19-aespa-popup-object.jpg' in line and line.startswith('![[Korea'):
        lines[i] = '![에스파의 세계관에 충실한 오브제가 전시된 팝업.](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/19-aespa-popup-object.jpg)'
        lines.insert(i+1, '*[Korea JoongAng Daily](https://koreajoongangdaily.joins.com/news/2024-05-29/entertainment/kpop/aespa-Armageddon-popup-brings-bands-virtual-world-to-life/2057425) 제공*')
        print('✅ Line 41: Korea JoongAng Daily 이미지 수정')

    # Line 48: THE FACT image
    elif '19-aespa-y2k-popup.jpg' in line and line.startswith('![[THE'):
        lines[i] = '![에스파 특유의 Y2K 세기말 감성을 극대화한 팝업](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/19-aespa-y2k-popup.jpg)'
        lines.insert(i+1, '*[THE FACT](https://news.tf.co.kr/read/entertain/2105266.htm) 제공*')
        print('✅ Line 48: THE FACT 이미지 수정')

    # Remove any duplicate source lines (들여쓰기 4칸)
    elif line.startswith('    *SM 제공*'):
        lines[i] = ''
        print('✅ 중복 출처 라인 제거')

# Clean up empty lines (but keep double newlines for paragraph breaks)
content = '\n'.join(lines)

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 19).execute()
    print('✅ Article 19 최종 수정 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
