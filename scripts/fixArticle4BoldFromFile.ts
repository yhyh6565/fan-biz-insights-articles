import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 4;

async function fixArticle4BoldFromFile() {
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

  // line13.txt 파일에서 원본 라인 읽기
  const originalLine = fs.readFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/line13.txt', 'utf-8').trim();

  // "**아티스트와" 부터 "참여자'**" 까지 찾기
  const startIdx = originalLine.indexOf('**아티스트');
  const endIdx = originalLine.indexOf('**입니다', startIdx + 1);

  if (startIdx !== -1 && endIdx !== -1) {
    const oldText = originalLine.substring(startIdx, endIdx + 2); // '**' 포함
    const newText = oldText.replace(/^\*\*/g, '').replace(/\*\*$/g, ''); // 앞뒤 ** 제거

    console.log('원본 텍스트:');
    console.log(oldText);
    console.log('\n새 텍스트:');
    console.log(newText);

    if (content.includes(oldText)) {
      content = content.replace(oldText, newText);
      console.log('\n✅ Bold 제거 완료');
    } else {
      console.log('\n❌ 해당 텍스트를 찾을 수 없습니다.');
      process.exit(1);
    }
  } else {
    console.log('❌ 텍스트 범위를 찾을 수 없습니다.');
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

fixArticle4BoldFromFile()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
