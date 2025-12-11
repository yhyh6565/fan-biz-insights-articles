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

# 이미지 및 출처 주변 라인 출력
for i, line in enumerate(lines):
    if '![' in line or '*' in line and '제공' in line:
        # 이전 1줄, 현재 줄, 다음 2줄 출력
        print(f"\n--- Around Line {i+1} ---")
        if i > 0:
            print(f"{i}: {lines[i-1][:80]}")
        print(f"{i+1}: {line[:80]}")
        if i+1 < len(lines):
            print(f"{i+2}: {lines[i+1][:80]}")
        if i+2 < len(lines):
            print(f"{i+3}: {lines[i+2][:80]}")
