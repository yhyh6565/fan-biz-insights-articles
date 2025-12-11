import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function extractExactText() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 4)
    .single();

  if (data) {
    const lines = data.content.split('\n');
    const line = lines.find(l => l.includes('특히 K-POP'));

    if (line) {
      // 전체 라인을 파일로 저장
      fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/line13.txt', line);
      console.log('✅ line13.txt에 저장했습니다.');

      // "**아티스트와" 부터 "참여자'**" 까지 찾기
      const startIdx = line.indexOf('**아티스트');
      if (startIdx !== -1) {
        const endIdx = line.indexOf('**입니다', startIdx + 1);
        if (endIdx !== -1) {
          const extracted = line.substring(startIdx, endIdx + 2); // '**' 포함
          console.log('\n추출된 텍스트:');
          console.log(extracted);

          console.log('\n각 문자:');
          for (let i = 0; i < extracted.length; i++) {
            const char = extracted[i];
            const code = char.charCodeAt(0);
            console.log(`${i}: '${char}' (U+${code.toString(16).toUpperCase().padStart(4, '0')})`);
          }
        }
      }
    }
  }
}

extractExactText()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
