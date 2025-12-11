import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function removeIndent() {
  console.log('📝 불렛 포인트 인덴트 제거 중...\n');

  // 모든 articles 가져오기
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('article_number, title, content')
    .order('article_number');

  if (fetchError || !articles) {
    console.error('❌ 글을 가져올 수 없습니다:', fetchError?.message);
    process.exit(1);
  }

  console.log(`총 ${articles.length}개의 글을 처리합니다.\n`);

  for (const article of articles) {
    let content = article.content;
    const lines = content.split('\n');
    let modified = false;
    let bulletCount = 0;

    // 각 라인을 검사하여 4칸 공백으로 시작하는 불렛 포인트 찾기
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 4칸 공백 + 불렛으로 시작하는 줄 찾기
      if (/^    ([-*+]) /.test(line)) {
        // 4칸 공백 제거
        lines[i] = line.substring(4);
        modified = true;
        bulletCount++;
      }
    }

    if (modified) {
      content = lines.join('\n');

      // DB 업데이트
      const { error: updateError } = await supabase
        .from('articles')
        .update({ content })
        .eq('article_number', article.article_number);

      if (updateError) {
        console.log(`❌ [${article.article_number}] "${article.title}" 업데이트 실패:`, updateError.message);
      } else {
        console.log(`✅ [${article.article_number}] "${article.title}" - ${bulletCount}개 불렛 인덴트 제거`);
      }
    } else {
      console.log(`⏭️  [${article.article_number}] "${article.title}" - 수정 사항 없음`);
    }
  }

  console.log('\n✅ 모든 글 처리 완료!');
}

removeIndent()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
