#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [19] 중복 캡션 제거 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

# 제거할 중복 텍스트 패턴
duplicates_to_remove = [
    'Korea JoongAng Daily 제공',
    'Korea JoongAng Daily 제공. 에스파의 세계관에 충실한 오브제가 전시된 팝업.',
    '[THE FACT](https://news.tf.co.kr/read/entertain/2105266.htm) 제공, 에스파 특유의 Y2K 세기말 감성을 극대화한 팝업',
    'SM 제공',
    'SM 제공.',
]

lines = content.split('\n')
new_lines = []
removed_count = 0

for i, line in enumerate(lines):
    stripped = line.strip()
    
    # 이미지 라인은 유지
    if stripped.startswith('![') or (stripped.startswith('*') and '제공*' in stripped):
        new_lines.append(line)
        continue
    
    # 중복 캡션 텍스트 체크
    should_remove = False
    for dup in duplicates_to_remove:
        if dup in stripped and not stripped.startswith('!['):
            should_remove = True
            removed_count += 1
            print(f'✅ Line {i+1}: "{stripped[:60]}..." 제거')
            break
    
    if not should_remove:
        new_lines.append(line)

content = '\n'.join(new_lines)

# Update database
if removed_count > 0:
    print(f'\n💾 데이터베이스 업데이트 중... ({removed_count}개 라인 제거)')
    try:
        supabase.table('articles').update({'content': content}).eq('article_number', 19).execute()
        print('✅ 완료!')
    except Exception as e:
        print(f'❌ 업데이트 실패: {e}')
else:
    print('\n✅ 제거할 중복 캡션 없음')
