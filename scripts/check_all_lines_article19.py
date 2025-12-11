#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

# 전체 content에서 출처 키워드 검색
keywords = ['Korea JoongAng', 'THE FACT', 'SM 제공', 'Tripadvisor', '연합뉴스', '이투데이', 'Klook']

print("본문에서 출처 키워드 검색 중...\n")

lines = content.split('\n')
for i, line in enumerate(lines, 1):
    for keyword in keywords:
        if keyword in line:
            # 캡션이 아닌 경우만 출력
            if not (line.strip().startswith('*') and line.strip().endswith('*')):
                if not line.strip().startswith('!['):
                    print(f"Line {i} ({keyword}): {line[:120]}")
                    break
