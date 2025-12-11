#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 Article 13 목걸이 캡션 수정 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

# Fix necklace caption
if '![엑소 초능력 목걸이.jpg]' in content:
    content = content.replace('![엑소 초능력 목걸이.jpg]', '![EXO 초능력 목걸이 굿즈]')
    print('✅ 목걸이 캡션 수정: "엑소 초능력 목걸이.jpg" → "EXO 초능력 목걸이 굿즈"')

    # Update database
    supabase.table('articles').update({'content': content}).eq('article_number', 13).execute()
    print('✅ 데이터베이스 업데이트 완료!')
else:
    print('ℹ️  목걸이 캡션이 이미 수정되었습니다.')
