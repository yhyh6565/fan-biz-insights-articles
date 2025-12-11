import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 2;

async function fixThirdItem() {
  console.log('📝 [2] 세 번째 항목 번호 수정 중...\n');

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

  // 라인 80 (인덱스 79)을 3.으로 수정
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('**팬덤과의 관계를 고려하지 않은 확장은')) {
      lines[i] = lines[i].replace(/^2\./, '3.');
      console.log(`✅ 세 번째 항목 수정 (라인 ${i + 1}): ${lines[i].substring(0, 60)}...`);
      break;
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

  console.log('✅ 세 번째 항목 번호 수정 완료!');
}

fixThirdItem()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
