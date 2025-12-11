#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [19] 캡션 아래 중복 출처 텍스트 제거 중...\n')

response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

lines = content.split('\n')
lines_to_remove = []

for i in range(len(lines)):
    line = lines[i].strip()
    
    # 이탤릭 캡션 라인인 경우 (*제공*)
    if line.startswith('*') and line.endswith('*') and '제공' in line:
        # 다음 몇 줄을 확인
        for j in range(i+1, min(i+5, len(lines))):
            next_line = lines[j].strip()
            
            # 빈 줄은 스킵
            if not next_line:
                continue
            
            # 출처 중복 체크
            # 패턴 1: "Korea JoongAng Daily 제공" 형태
            # 패턴 2: "Korea JoongAng Daily 제공. 설명" 형태
            if '제공' in next_line and not next_line.startswith('![') and not next_line.startswith('*'):
                # 불릿 포인트나 다른 본문이 아닌지 확인
                if not next_line.startswith('-') and not next_line.startswith('##'):
                    # 출처 이름 추출
                    sources = ['Korea JoongAng Daily', 'THE FACT', 'SM', 'Tripadvisor', 'Klook', '연합뉴스', '이투데이', '강남구청']
                    
                    for source in sources:
                        if source in next_line and source in line:
                            lines_to_remove.append(j)
                            print(f'✅ Line {j+1}: "{next_line[:80]}..." 제거')
                            break
                break

# 중복 제거
new_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
content = '\n'.join(new_lines)

if lines_to_remove:
    print(f'\n💾 데이터베이스 업데이트 중... ({len(lines_to_remove)}개 라인 제거)')
    try:
        supabase.table('articles').update({'content': content}).eq('article_number', 19).execute()
        print('✅ 완료!')
    except Exception as e:
        print(f'❌ 업데이트 실패: {e}')
else:
    print('\n✅ 제거할 중복 없음')
