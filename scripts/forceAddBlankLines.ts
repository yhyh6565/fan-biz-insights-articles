import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 5;

async function addBlankLines() {
  console.log('📝 [5] 빈 줄 추가 중...\n');

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

  const line125Idx = lines.findIndex(l => l.includes('그 결과 하이브는'));

  if (line125Idx !== -1) {
    console.log(`문장 1 (라인 ${line125Idx + 1}):`);
    console.log(`  현재: "${lines[line125Idx]}"`);
    console.log(`  다음: "${lines[line125Idx + 1]}"`);
    console.log(`  다다음: "${lines[line125Idx + 2]}"`);

    // 빈 줄 하나 추가
    lines.splice(line125Idx + 1, 0, '');
    console.log('✅ 빈 줄 1개 추가함');
  }

  // 인덱스 재검색 (배열이 변경되었으므로)
  const line135Idx = lines.findIndex(l => l.includes('이처럼 세 플랫폼은'));

  if (line135Idx !== -1) {
    console.log(`\n문장 2 (라인 ${line135Idx + 1}):`);
    console.log(`  현재: "${lines[line135Idx]}"`);
    console.log(`  다음: "${lines[line135Idx + 1]}"`);
    console.log(`  다다음: "${lines[line135Idx + 2]}"`);

    // 빈 줄 하나 추가
    lines.splice(line135Idx + 1, 0, '');
    console.log('✅ 빈 줄 1개 추가함');
  }

  content = lines.join('\n');

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

addBlankLines()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
