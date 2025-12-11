import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 1;

async function removeBoldFormatting() {
  console.log('📝 [1] 팬덤은 안정적인 덕질을 원한다 (1) - 볼드 제거 중...\n');

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

  // 1. "매력뿐만이 아닙니다. ****" 에서 **** 제거
  content = content.replace(/매력뿐만이 아닙니다\. \*\*\*\*/g, '매력뿐만이 아닙니다.');

  // 2. 아이돌 팬덤 비즈니스의 핵심 가치... 부분 볼드 제거
  content = content.replace(
    /즉, \*\*아이돌 팬덤 비즈니스의 핵심 가치는 '예측 가능한 팀 체제'에서 형성되는 '멤버 간의 관계성'\*\*입니다\./g,
    "즉, 아이돌 팬덤 비즈니스의 핵심 가치는 '예측 가능한 팀 체제'에서 형성되는 '멤버 간의 관계성'입니다."
  );

  // 3. '지속적으로 유지되는 것' 부분 볼드 제거
  content = content.replace(
    /\*\*'지속적으로 유지되는 것'\*\*입니다\./g,
    "'지속적으로 유지되는 것'입니다."
  );

  console.log('✅ 볼드 처리 제거 완료');
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

removeBoldFormatting()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
