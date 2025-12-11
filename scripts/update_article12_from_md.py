#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 12 마크다운 파일에서 업데이트 중...\n')

# Read markdown file
md_file_path = '/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/세계관 하나로 2차 IP 매출 2.5배/세계관 하나로 2차 IP 매출 2.5배.md'

try:
    with open(md_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f'✅ 마크다운 파일 읽기 완료')
    print(f'   - 길이: {len(content)} 문자\n')

    # Update database
    response = supabase.table('articles').update({'content': content}).eq('article_number', 12).execute()

    print('✅ Article 12 데이터베이스 업데이트 완료!')

except Exception as e:
    print(f'❌ 오류 발생: {e}')
