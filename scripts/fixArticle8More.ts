import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 8;

async function fixMore() {
  console.log('📝 [8] 추가 수정 중...\n');

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

  // 1. [[ 를 [ 로 수정 (이중 대괄호 제거)
  if (content.includes('[[')) {
    content = content.replace(/\[\[/g, '[');
    console.log('✅ 이중 대괄호 제거');
  }

  // 2. 한 단어만 볼드 처리된 경우 제거 (예: **품절**)
  // 단, 중요한 키워드는 유지 (CDP, VHS 등은 제외)
  const singleWordBold = /\*\*(품절|완판|매진)\*\*/g;
  if (content.match(singleWordBold)) {
    content = content.replace(singleWordBold, '$1');
    console.log('✅ 단어 단위 볼드 제거 (품절, 완판, 매진)');
  }

  // 3. 문장 전체가 볼드 처리된 경우 (너무 긴 볼드)
  // 예: **~입니다.** 형태에서 50자 이상인 경우
  const longBold = /\*\*([^*]{50,}?[.!?])\*\*/g;
  const longMatches = content.match(longBold);
  if (longMatches && longMatches.length > 0) {
    content = content.replace(longBold, '$1');
    console.log(`✅ 긴 문장 볼드 ${longMatches.length}개 제거`);
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

  console.log('✅ 추가 수정 완료!');
}

fixMore()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
