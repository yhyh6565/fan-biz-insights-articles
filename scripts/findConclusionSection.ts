import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function findConclusion() {
  const { data } = await supabase.from('articles').select('content').eq('article_number', 2).single();

  if (data) {
    // "결론" 또는 "정리" 키워드가 있는 부분을 찾기
    const conclusionIndex = data.content.search(/###?\s*[\*\s]*결론|###?\s*[\*\s]*정리|###?\s*[\*\s]*핵심/i);

    if (conclusionIndex !== -1) {
      console.log('결론 부분 (200자):');
      console.log(data.content.substring(conclusionIndex, conclusionIndex + 800));
    } else {
      console.log('결론 섹션을 찾을 수 없습니다.');
      console.log('\n마지막 500자:');
      console.log(data.content.substring(data.content.length - 500));
    }
  }
}

findConclusion()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
