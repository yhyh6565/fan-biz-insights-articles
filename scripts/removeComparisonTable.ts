import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 5;

async function removeComparisonTable() {
  console.log('📝 [5] cf) 플랫폼 비교 표 제거 중...\n');

  // 현재 콘텐츠 가져오기
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

  // "cf) 플랫폼 비교" 부분 찾기 및 제거
  const cfIndex = content.indexOf('cf) 플랫폼 비교');

  if (cfIndex !== -1) {
    // cf) 부분부터 끝까지 제거
    content = content.substring(0, cfIndex).trim();
    console.log('✅ cf) 플랫폼 비교 표를 찾았습니다. 제거 중...');
  } else {
    console.log('⚠️  cf) 플랫폼 비교 표를 찾을 수 없습니다.');
    process.exit(0);
  }

  console.log('\n📝 Supabase에 업데이트 중...');

  // Supabase 업데이트
  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 플랫폼 비교 표 제거 완료!');
}

removeComparisonTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
