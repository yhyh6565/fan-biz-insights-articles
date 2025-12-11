#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Get all articles
response = supabase.table('articles').select('article_number, title').order('article_number').execute()

print('🔍 검색 결과:\n')
for article in response.data:
    if '10년' in article['title'] or '떡밥' in article['title'] or '27.9' in article['title']:
        print(f"Article {article['article_number']}: {article['title']}")
