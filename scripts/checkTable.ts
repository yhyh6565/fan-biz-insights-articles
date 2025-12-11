import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTable() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 4)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('표 부분 찾기 (라인 51부터):\n');
    for (let i = 50; i < 63; i++) {
      console.log(`라인 ${i + 1}: ${lines[i]}`);
    }

    // 파일로도 저장
    const tableSection = lines.slice(50, 63).join('\n');
    fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/table_section.txt', tableSection);
    console.log('\n✅ table_section.txt에 저장했습니다.');
  }
}

checkTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
