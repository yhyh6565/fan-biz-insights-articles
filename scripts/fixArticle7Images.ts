import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 7;

async function fixImages() {
  console.log('📝 [7] 이미지 마크다운 수정 중...\n');

  const { data: article, error: fetchError } = await supabase
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

  // 이미지가 포함된 라인의 앞 공백 제거
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // 4칸 이상의 공백 + 이미지 마크다운으로 시작하는 라인 찾기
    if (/^\s{3,}!\[/.test(line)) {
      // 공백을 완전히 제거
      lines[i] = line.trim();
      console.log(`✅ 라인 ${i + 1} 수정: 공백 제거`);
    }
  }

  content = lines.join('\n');

  console.log('\n📝 Supabase에 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 이미지 마크다운 수정 완료!');
}

fixImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
