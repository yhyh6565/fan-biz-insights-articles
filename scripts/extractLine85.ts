import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function extractLine85() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 4)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    // 85번 라인 (0-based index는 84)
    if (lines[84]) {
      console.log('라인 85:');
      console.log(lines[84]);

      fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/line85.txt', lines[84]);
      console.log('\n✅ line85.txt에 저장했습니다.');
    }
  }
}

extractLine85()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
