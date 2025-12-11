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

lines = content.split('\n')

# 출처 관련 키워드로 본문 라인 찾기
for i, line in enumerate(lines, 1):
    stripped = line.strip()
    
    # 이미지나 캡션 라인은 제외
    if stripped.startswith('![') or (stripped.startswith('*') and stripped.endswith('*')):
        continue
    
    # 본문에서 출처 언급 찾기
    if any(keyword in stripped for keyword in ['제공', 'Korea JoongAng Daily', 'THE FACT', 'SM 제공', 'Tripadvisor']):
        print(f"Line {i}: {stripped[:100]}")
