#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co'
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print('🔍 Article 13 렌더링 문제 확인 중...\n')

# Get content
response = supabase.table('articles').select('content').eq('article_number', 13).single().execute()
content = response.data['content']

lines = content.split('\n')

# Check for 4+ leading spaces (markdown code block issue)
problem_lines = []

for i, line in enumerate(lines):
    leading_spaces = len(line) - len(line.lstrip())

    # Check for 4+ spaces in non-image lines
    if leading_spaces >= 4 and line.strip() and not line.strip().startswith('!['):
        problem_lines.append((i+1, leading_spaces, line.strip()[:80]))

if problem_lines:
    print(f'⚠️  렌더링 문제가 있을 수 있는 라인들 ({len(problem_lines)}개):')
    for line_num, spaces, text in problem_lines:
        print(f'  라인 {line_num} ({spaces} spaces): {text}...')

    print(f'\n💡 4칸 이상 들여쓰기는 마크다운에서 코드 블록으로 인식될 수 있습니다.')
    print(f'   일반 텍스트로 렌더링하려면 2칸 들여쓰기로 수정하는 것을 권장합니다.')
else:
    print('✅ 렌더링 문제 없음!')
