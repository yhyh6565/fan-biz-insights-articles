#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv
import re

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('📝 [19] Article 19 캡션 포맷 정리 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 19).single().execute()
content = response.data['content']

lines = content.split('\n')
new_lines = []
i = 0

while i < len(lines):
    line = lines[i]

    # Check if this is an image line with caption in alt text
    if line.strip().startswith('![') and '](' in line:
        # Extract alt text (caption)
        alt_start = line.find('![') + 2
        alt_end = line.find('](')
        url_start = alt_end + 2
        url_end = line.rfind(')')

        alt_text = line[alt_start:alt_end]
        url = line[url_start:url_end]

        # Check if alt_text contains source info (링크 포함)
        # Pattern 1: [Source](link) 제공. Description
        # Pattern 2: Source 제공. Description
        if '[' in alt_text and '](' in alt_text and '제공' in alt_text:
            # Extract source link and description
            source_start = alt_text.find('[')
            source_link_start = alt_text.find('](', source_start) + 2
            source_link_end = alt_text.find(')', source_link_start)
            source_name = alt_text[source_start+1:alt_text.find(']', source_start)]
            source_url = alt_text[source_link_start:source_link_end]

            # Extract description (part after 제공)
            desc_start = alt_text.find('제공')
            if desc_start != -1:
                description = alt_text[desc_start+2:].strip()
                if description.startswith('.'):
                    description = description[1:].strip()

                # Create new format
                new_lines.append(f'![{description}]({url})')
                new_lines.append(f'*[{source_name}]({source_url}) 제공*')
                print(f'✅ Line {i+1}: 캡션 분리 - {source_name}')
            else:
                new_lines.append(line)
        elif '제공' in alt_text:
            # Pattern: Source 제공. Description (no link)
            parts = alt_text.split('제공.')
            if len(parts) == 2:
                source = parts[0].strip()
                description = parts[1].strip()

                new_lines.append(f'![{description}]({url})')
                new_lines.append(f'*{source} 제공*')
                print(f'✅ Line {i+1}: 캡션 분리 - {source}')
            else:
                new_lines.append(line)
        else:
            # No 제공, keep as is
            new_lines.append(line)
    else:
        new_lines.append(line)

    i += 1

content = '\n'.join(new_lines)

# Update database
print('\n💾 데이터베이스 업데이트 중...')
try:
    supabase.table('articles').update({'content': content}).eq('article_number', 19).execute()
    print('✅ Article 19 캡션 포맷 정리 완료!')
except Exception as e:
    print(f'❌ 업데이트 실패: {e}')
