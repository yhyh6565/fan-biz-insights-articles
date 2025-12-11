#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Search for articles
keywords = ['10년', '떡밥', '27.9억']

for keyword in keywords:
    print(f'\n🔍 "{keyword}" 검색 중...')
    response = supabase.table('articles').select('article_number, title').ilike('title', f'%{keyword}%').execute()

    if response.data:
        for article in response.data:
            print(f"  Article {article['article_number']}: {article['title']}")
    else:
        print(f'  결과 없음')
