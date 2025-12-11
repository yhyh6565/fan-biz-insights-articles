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

# 이탤릭 캡션 라인과 그 다음 5줄 출력
for i, line in enumerate(lines):
    if line.strip().startswith('*') and line.strip().endswith('*') and '제공' in line:
        print(f"\n=== 캡션 발견: Line {i+1} ===")
        for j in range(max(0, i-1), min(i+6, len(lines))):
            marker = ">>>" if j == i else "   "
            print(f"{marker} {j+1}: [{lines[j]}]")
