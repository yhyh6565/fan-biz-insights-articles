import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 6;

async function updatePhotocardText() {
  console.log('📝 [6] 사진 한 장에 300만 원? - 포토카드 볼드 제거 중...\n');

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

  // **포토카드(Photocard)** -> 포토카드(Photocard)로 변경
  content = content.replace(/\*\*포토카드\(Photocard\)\*\*/g, '포토카드(Photocard)');

  console.log('✅ 포토카드 볼드 처리 제거 완료');
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

  console.log('✅ 콘텐츠 업데이트 완료!');
}

updatePhotocardText()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
