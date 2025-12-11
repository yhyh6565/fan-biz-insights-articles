import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 10;

async function fixImages() {
  console.log('📝 [10] 이미지 렌더링 수정 중...\n');

  const { data: article, error: fetchError} = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', ARTICLE_NUMBER)
    .single();

  if (fetchError || !article) {
    console.error('❌ 글을 찾을 수 없습니다:', fetchError?.message);
    process.exit(1);
  }

  let content = article.content;
  const lines = content.split('\n');
  const newLines: string[] = [];

  // 4개 공백 제거
  let fixedSpaces = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const leadingSpaces = line.length - line.trimStart().length;

    // 4개 이상 공백이 있고 이미지인 경우
    if (leadingSpaces >= 4 && line.trim().startsWith('![')) {
      newLines.push(line.trim());
      fixedSpaces++;
    } else {
      newLines.push(line);
    }
  }

  content = newLines.join('\n');

  if (fixedSpaces > 0) {
    console.log(`✅ ${fixedSpaces}개 이미지의 공백 제거`);
  }

  console.log('\n📝 Supabase에 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 이미지 렌더링 수정 완료!');
}

fixImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
