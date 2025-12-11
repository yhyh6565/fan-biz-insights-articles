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

# 35-55번 라인만 출력 (첫 번째 이미지 섹션)
print("=== Lines 35-55 (First image section) ===\n")
for i in range(34, min(55, len(lines))):
    print(f"Line {i+1}:")
    print(repr(lines[i]))
    print()
