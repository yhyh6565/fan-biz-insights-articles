import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBERS = [6, 7, 8, 9];
const NEW_KEYWORD = '애정의 실체화';

async function updateKeywords() {
  console.log('📝 4개 글의 키워드를 "애정의 실체화"로 업데이트 중...\n');

  for (const articleNumber of ARTICLE_NUMBERS) {
    const { data, error } = await supabase
      .from('articles')
      .update({ keywords: [NEW_KEYWORD] })
      .eq('article_number', articleNumber)
      .select('article_number, title');

    if (error) {
      console.log(`❌ [${articleNumber}] 업데이트 실패:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ [${articleNumber}] ${data[0].title}`);
      console.log(`   → 키워드: "${NEW_KEYWORD}"`);
    } else {
      console.log(`⚠️  [${articleNumber}] 글을 찾을 수 없습니다.`);
    }
  }

  console.log('\n🎉 모든 키워드 업데이트 완료!');
}

updateKeywords()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
