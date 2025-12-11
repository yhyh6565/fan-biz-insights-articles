import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 4;

async function fixArticle4Bold() {
  console.log('📝 [4] Bold 제거 중...\n');

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

  // 문자열 직접 교체 - 부분만 교체 (curly quotes 사용)
  const oldText = "**아티스트와 '독점적인 소통'을 원하는 '참여자'**";
  const newText = "아티스트와 '독점적인 소통'을 원하는 '참여자'";

  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    console.log('✅ Bold 제거 완료');
  } else {
    console.log('❌ 해당 텍스트를 찾을 수 없습니다.');
    console.log('현재 라인:');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('특히 K-POP')) {
        console.log(`라인 ${i+1}: ${line}`);
      }
    });
    process.exit(1);
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

  console.log('✅ 콘텐츠 업데이트 완료!');
}

fixArticle4Bold()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
