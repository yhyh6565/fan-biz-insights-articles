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

print('🔍 "정서적" 또는 "몰입"이 포함된 글:\n')
for article in response.data:
    if '정서적' in article['title'] or '몰입' in article['title'] or '분석적' in article['title']:
        print(f"Article {article['article_number']}: {article['title']}")

print('\n📋 모든 글 목록 (1-30):')
for article in response.data[:30]:
    print(f"{article['article_number']:2d}. {article['title']}")
