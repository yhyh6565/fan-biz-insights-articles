import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkCurrent() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 7)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('2️⃣ 섹션 확인 (라인 19부터):\n');
    for (let i = 18; i < 35; i++) {
      console.log(`라인 ${i + 1}: ${lines[i]}`);
    }

    // 파일로 저장
    fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/article7_section2.txt', lines.slice(18, 35).join('\n'));
    console.log('\n✅ article7_section2.txt에 저장했습니다.');
  }
}

checkCurrent()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
