import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 2;

async function fixNumbering() {
  console.log('📝 [2] 결론 번호 수정 중...\n');

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

  // 결론 부분에서 1. 로 시작하는 항목들을 1, 2, 3으로 변경
  // 마지막 부분의 3개의 "1. "을 순서대로 변경

  // 특정 패턴을 찾아서 변경
  // "1.  **그룹의 정체성..." -> "1.  **그룹의 정체성..." (첫번째는 유지)
  // "1.  **팬덤과의 관계..." -> "3.  **팬덤과의 관계..."

  // 더 안전한 방법: 특정 텍스트를 포함하는 라인을 찾아서 변경
  const lines = content.split('\n');
  let numberedItemCount = 0;
  let inConclusionArea = false;

  for (let i = 0; i < lines.length; i++) {
    // "를 소비합니다." 이후부터 결론 영역으로 간주
    if (lines[i].includes('를 소비합니다.')) {
      inConclusionArea = true;
    }

    if (inConclusionArea && /^1\.\s+\*\*/.test(lines[i])) {
      numberedItemCount++;
      if (numberedItemCount === 2) {
        lines[i] = lines[i].replace(/^1\./, '2.');
        console.log(`✅ 두 번째 항목 수정: ${lines[i].substring(0, 50)}...`);
      } else if (numberedItemCount === 3) {
        lines[i] = lines[i].replace(/^1\./, '3.');
        console.log(`✅ 세 번째 항목 수정: ${lines[i].substring(0, 50)}...`);
      } else if (numberedItemCount === 1) {
        console.log(`✅ 첫 번째 항목 유지: ${lines[i].substring(0, 50)}...`);
      }
    }
  }

  content = lines.join('\n');

  console.log(`\n📊 총 ${numberedItemCount}개의 번호 항목 발견`);
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

  console.log('✅ 결론 번호 수정 완료!');
}

fixNumbering()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
