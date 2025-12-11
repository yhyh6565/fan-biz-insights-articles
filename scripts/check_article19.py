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

# Check if images are properly rendered
lines = content.split('\n')
image_count = 0
for i, line in enumerate(lines, 1):
    if '![' in line and '](' in line:
        image_count += 1
        # Check if it's using Supabase URL or local path
        if 'supabase.co' in line:
            print(f"✅ Line {i}: Supabase URL")
        elif './' in line:
            print(f"❌ Line {i}: Local path - {line[:80]}...")
            
print(f"\n총 {image_count}개 이미지 발견")
