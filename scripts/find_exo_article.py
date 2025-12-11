#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

# Find EXO article
response = supabase.table('articles').select('id, article_number, title').execute()

print("검색 중...\n")
for article in response.data:
    if 'EXO' in article['title'] or '해석하라' in article['title'] or '밀리언셀러' in article['title']:
        print(f"[{article['article_number']}] {article['title']}")
        print(f"ID: {article['id']}\n")
