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

# 60-80번 라인 출력 (나머지 이미지들)
print("=== Lines 60-85 ===\n")
for i in range(59, min(85, len(lines))):
    print(f"{i+1}: {lines[i]}")
