import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function inspectQuotes() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 4)
    .single();

  if (data) {
    const lines = data.content.split('\n');
    const line = lines.find(l => l.includes('특히 K-POP'));

    if (line) {
      console.log('전체 라인:');
      console.log(line);
      console.log('\n문제 부분 추출:');

      const match = line.match(/\*\*아티스트와.+?참여자\*\*/);
      if (match) {
        console.log(match[0]);
        console.log('\n각 문자의 유니코드:');
        for (let i = 0; i < match[0].length; i++) {
          const char = match[0][i];
          const code = char.charCodeAt(0);
          console.log(`${i}: '${char}' (U+${code.toString(16).toUpperCase().padStart(4, '0')})`);
        }
      }
    }
  }
}

inspectQuotes()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
