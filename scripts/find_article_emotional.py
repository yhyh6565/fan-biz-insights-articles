#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Find article
search_title = '정서적 몰입 vs 분석적 해석'
response = supabase.table('articles').select('article_number, title').execute()

print('🔍 검색 결과:\n')
for article in response.data:
    if '정서적' in article['title'] or '분석적' in article['title'] or '몰입' in article['title']:
        print(f"Article {article['article_number']}: {article['title']}")
