import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function extractCurrentLines() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 4)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    // 1️⃣이 포함된 라인 찾기
    const targetLineIdx = lines.findIndex(l => l.includes('1️⃣'));

    if (targetLineIdx !== -1) {
      console.log(`라인 ${targetLineIdx + 1}:`);
      console.log(lines[targetLineIdx]);

      if (lines[targetLineIdx + 1]) {
        console.log(`\n라인 ${targetLineIdx + 2}:`);
        console.log(lines[targetLineIdx + 1]);
      }

      if (lines[targetLineIdx + 2]) {
        console.log(`\n라인 ${targetLineIdx + 3}:`);
        console.log(lines[targetLineIdx + 2]);
      }

      // 3줄을 파일로 저장
      const threeLines = lines.slice(targetLineIdx, targetLineIdx + 3).join('\n');
      fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/current_conclusion.txt', threeLines);
      console.log('\n✅ current_conclusion.txt에 저장했습니다.');
    }
  }
}

extractCurrentLines()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
