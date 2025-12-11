import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 4;

async function fixArticle4LineBreaks() {
  console.log('📝 [4] 줄바꿈 추가 중...\n');

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

  // 현재 텍스트 (각 문장이 이미 다른 라인에 있음)
  const oldText = `1️⃣ 팬덤뿐만 아니라 모든 비즈니스에서 **독점성과 감정적 욕구의 결합**은 강력한 충성도를 만듭니다.
2️⃣ '특별한 경험'을 통해 고객의 정서적 유대와 브랜드 가치를 높이는 브랜드의 경쟁력이 될 수 있습니다.
3️⃣ 엔터 산업에서는 **정서적 연결이 핵심 자산**이므로, 이를 가능하게 할 소통 채널 설계가 중요합니다.`;

  // 새 텍스트 (줄바꿈 추가)
  const newText = `1️⃣ 팬덤뿐만 아니라 모든 비즈니스에서 **독점성과 감정적 욕구의 결합**은 강력한 충성도를 만듭니다.

2️⃣ '특별한 경험'을 통해 고객의 정서적 유대와 브랜드 가치를 높이는 브랜드의 경쟁력이 될 수 있습니다.

3️⃣ 엔터 산업에서는 **정서적 연결이 핵심 자산**이므로, 이를 가능하게 할 소통 채널 설계가 중요합니다.`;

  if (content.includes(oldText)) {
    content = content.replace(oldText, newText);
    console.log('✅ 줄바꿈 추가 완료');
  } else {
    console.log('❌ 해당 텍스트를 찾을 수 없습니다.');

    // 전략적 시사점 부분 찾아보기
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('1️⃣') || line.includes('팬덤뿐만')) {
        console.log(`라인 ${i+1}: ${line.substring(0, 100)}...`);
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

fixArticle4LineBreaks()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
