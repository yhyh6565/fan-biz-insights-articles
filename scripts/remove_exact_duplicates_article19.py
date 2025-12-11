#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [19] 중복 출처 텍스트 제거 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

lines = content.split('\n')
lines_to_remove = []

# 이미지와 출처 캡션 다음에 오는 중복 텍스트 찾기
for i in range(len(lines) - 1):
    line = lines[i]
    next_line = lines[i+1] if i+1 < len(lines) else ''
    next_next_line = lines[i+2] if i+2 < len(lines) else ''
    
    # 패턴: *[Source](link) 제공* 다음에 빈 줄, 그 다음에 중복 출처 텍스트
    if line.strip().startswith('*[') and '제공*' in line:
        # 다음 줄이 빈 줄이고
        if next_line.strip() == '':
            # 그 다음 줄에 출처 링크가 있으면 (중복)
            if '[Korea JoongAng Daily]' in next_next_line or '[THE FACT]' in next_next_line:
                lines_to_remove.append(i+2)
                print(f'✅ Line {i+3}: 중복 출처 텍스트 제거 - {next_next_line.strip()[:60]}...')

# 제거
new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
content = '\n'.join(new_lines)

# Update database
if lines_to_remove:
    print(f'\n💾 데이터베이스 업데이트 중... ({len(lines_to_remove)}개 라인 제거)')
    try:
        supabase.table('articles').update({'content': content}).eq('article_number', 19).execute()
        print('✅ 완료!')
    except Exception as e:
        print(f'❌ 업데이트 실패: {e}')
else:
    print('\n✅ 제거할 중복 없음')
