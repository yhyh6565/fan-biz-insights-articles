import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 3;

async function updateArticle3() {
  console.log('📝 [3] 팬덤은 안정적인 덕질을 원한다 (3) - **** 제거 중...\n');

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

  // "이번 글에서는 **팬덤이 확장을 긍정적으로 받아들인 성공 사례**를 살펴보겠습니다. ****" 에서 **** 제거
  content = content.replace(/이번 글에서는 \*\*팬덤이 확장을 긍정적으로 받아들인 성공 사례\*\*를 살펴보겠습니다\. \*\*\*\*/g, '이번 글에서는 **팬덤이 확장을 긍정적으로 받아들인 성공 사례**를 살펴보겠습니다.');

  console.log('✅ **** 제거 완료');
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

updateArticle3()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
