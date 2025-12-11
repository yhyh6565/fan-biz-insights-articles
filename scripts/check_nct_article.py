#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

# Find NCT article
response = supabase.table('articles').select('id, article_number, title').execute()

print("검색 중...")
for article in response.data:
    if 'NCT' in article['title'] or '4,500' in article['title']:
        print(f"[{article['article_number']}] {article['title']}")
        print(f"ID: {article['id']}\n")
