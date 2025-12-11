#!/usr/bin/env python3
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client('https://limvajcxxkgleztxrqpx.supabase.co', os.getenv('SUPABASE_SERVICE_KEY'))

response = supabase.table('articles').select('content').eq('article_number', 12).single().execute()
content = response.data['content']

lines = content.split('\n')

print('=== 이미지 라인 확인 ===')
for i, line in enumerate(lines, 1):
    if '![' in line and '](' in line:
        leading_spaces = len(line) - len(line.lstrip())
        print(f'Line {i} (spaces: {leading_spaces}): {line[:100]}...' if len(line) > 100 else f'Line {i} (spaces: {leading_spaces}): {line}')

print('\n=== 4+ leading spaces 확인 ===')
problem_count = 0
for i, line in enumerate(lines, 1):
    leading_spaces = len(line) - len(line.lstrip())
    if leading_spaces >= 4 and line.strip():
        problem_count += 1
        print(f'Line {i} (spaces: {leading_spaces}): {line[:80]}...' if len(line) > 80 else f'Line {i} (spaces: {leading_spaces}): {line}')

if problem_count == 0:
    print('✅ 4+ leading spaces 없음!')
else:
    print(f'\n⚠️  아직 {problem_count}개 라인에 4+ leading spaces가 남아있습니다.')
