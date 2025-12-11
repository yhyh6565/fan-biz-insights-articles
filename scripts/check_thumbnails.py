#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

# Check articles 10 and 11
for article_num in [10, 11]:
    response = supabase.table('articles').select('article_number, title, thumbnail, hero_image').eq('article_number', article_num).single().execute()
    article = response.data

    print(f"=== Article {article_num} ===")
    print(f"Title: {article['title']}")
    print(f"Thumbnail: {article['thumbnail']}")
    print(f"Hero Image: {article['hero_image']}")
    print()
