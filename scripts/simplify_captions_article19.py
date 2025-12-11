#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv
import re

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [19] 캡션 간소화 중 (링크 제거)...\n')

response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

lines = content.split('\n')
modified_count = 0

for i, line in enumerate(lines):
    stripped = line.strip()
    
    # 패턴: *[Source](link) 제공*
    if stripped.startswith('*[') and '](' in stripped and '제공*' in stripped:
        # 링크 제거하고 단순하게 변경
        # *[Korea JoongAng Daily](링크) 제공* -> *Korea JoongAng Daily 제공*
        match = re.match(r'\*\[([^\]]+)\]\([^\)]+\)\s*제공\*', stripped)
        if match:
            source_name = match.group(1)
            new_line = f'*{source_name} 제공*'
            lines[i] = new_line
            modified_count += 1
            print(f'✅ Line {i+1}: "{stripped}" -> "{new_line}"')

content = '\n'.join(lines)

if modified_count > 0:
    print(f'\n💾 데이터베이스 업데이트 중... ({modified_count}개 캡션 수정)')
    try:
        supabase.table('articles').update({'content': content}).eq('article_number', 19).execute()
        print('✅ 완료!')
    except Exception as e:
        print(f'❌ 업데이트 실패: {e}')
else:
    print('\n✅ 수정할 캡션 없음')
