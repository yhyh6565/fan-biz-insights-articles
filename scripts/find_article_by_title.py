#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Find article
search_title = '10년간 심은 떡밥, 27.9억 달러로 회수되다'
response = supabase.table('articles').select('article_number, title').ilike('title', f'%{search_title}%').execute()

if response.data:
    for article in response.data:
        print(f"Article {article['article_number']}: {article['title']}")
else:
    print(f'❌ "{search_title}"를 찾을 수 없습니다.')
