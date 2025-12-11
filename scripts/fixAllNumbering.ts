import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 2;

async function fixAllNumbering() {
  console.log('📝 [2] 모든 번호 항목 수정 중...\n');

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
  const lines = content.split('\n');
  let numberedItemCount = 0;

  // 모든 "1. **"로 시작하는 라인을 찾아서 순서대로 번호 부여
  for (let i = 0; i < lines.length; i++) {
    if (/^1\.\s+\*\*/.test(lines[i])) {
      numberedItemCount++;
      if (numberedItemCount === 1) {
        // 첫 번째는 1로 유지
        console.log(`✅ 첫 번째 항목 (라인 ${i + 1}): ${lines[i].substring(0, 60)}...`);
      } else if (numberedItemCount === 2) {
        lines[i] = lines[i].replace(/^1\./, '2.');
        console.log(`✅ 두 번째 항목 (라인 ${i + 1}): ${lines[i].substring(0, 60)}...`);
      } else if (numberedItemCount === 3) {
        lines[i] = lines[i].replace(/^1\./, '3.');
        console.log(`✅ 세 번째 항목 (라인 ${i + 1}): ${lines[i].substring(0, 60)}...`);
      }
    }
  }

  content = lines.join('\n');

  console.log(`\n📊 총 ${numberedItemCount}개의 번호 항목 처리 완료`);
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

  console.log('✅ 모든 번호 수정 완료!');
}

fixAllNumbering()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
