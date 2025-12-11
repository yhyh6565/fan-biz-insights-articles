#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔍 Article 17 최종 검증 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 17).single().execute()
content = response.data['content']

lines = content.split('\n')

# Show lines around the fixed area
print('✅ 수정된 부분 확인 (라인 80-88):')
for i in range(79, min(89, len(lines))):
    if lines[i].strip():
        print(f'  라인 {i+1}: {lines[i][:100]}')
