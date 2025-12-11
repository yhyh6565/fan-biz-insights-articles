import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 2;

async function updateArticle2() {
  console.log('📝 [2] 팬덤은 안정적인 덕질을 원한다 (2) - 수정 중...\n');

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

  // 1. "****<Miracle> 활동 이후" 앞의 ** 제거
  content = content.replace(/\*\*\*\*<Miracle> 활동 이후/g, '**<Miracle> 활동 이후');
  console.log('✅ Miracle 앞 ** 제거 완료');

  // 2. 결론 부분 번호 수정 (1, 1, 1 -> 1, 2, 3)
  // 결론 섹션을 찾아서 번호 수정
  // 패턴: 1️⃣ **... 로 시작하는 줄들을 찾아서 순서대로 1, 2, 3으로 변경

  // 결론 부분을 찾아서 각 항목의 번호를 수정
  const conclusionMatch = content.match(/(### 🎯 결론[\s\S]*?)(?=\n##|\n---|\n\*\*\*|$)/);

  if (conclusionMatch) {
    let conclusionSection = conclusionMatch[1];

    // 1️⃣로 시작하는 줄들을 찾기
    const items = conclusionSection.match(/1️⃣ \*\*[^*]+\*\*/g);

    if (items && items.length >= 3) {
      // 두 번째와 세 번째 항목을 2️⃣, 3️⃣로 변경
      let modifiedSection = conclusionSection;

      // 첫 번째 1️⃣은 그대로 두고, 두 번째 1️⃣을 2️⃣로
      let count = 0;
      modifiedSection = modifiedSection.replace(/1️⃣/g, (match) => {
        count++;
        if (count === 1) return '1️⃣';
        if (count === 2) return '2️⃣';
        if (count === 3) return '3️⃣';
        return match;
      });

      content = content.replace(conclusionSection, modifiedSection);
      console.log('✅ 결론 번호 수정 완료 (1, 2, 3)');
    }
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

  console.log('✅ 콘텐츠 업데이트 완료!');
}

updateArticle2()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
