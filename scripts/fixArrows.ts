import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 7;

async function fixArrows() {
  console.log('📝 [7] 화살표 라인 공백 제거 중...\n');

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

  // 화살표로 시작하는 라인의 앞 공백 제거 (4칸 이상인 경우)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;

    // 4칸 이상의 공백 + 화살표로 시작하는 라인 찾기
    if (leadingSpaces >= 4 && line.trim().startsWith('→')) {
      // 공백을 완전히 제거
      lines[i] = line.trim();
      console.log(`✅ 라인 ${i + 1} 수정: ${leadingSpaces}칸 공백 제거`);
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

  console.log('✅ 화살표 라인 수정 완료!');
}

fixArrows()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
