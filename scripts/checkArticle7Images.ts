import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkImages() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 7)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('이미지가 포함된 라인들:\n');
    lines.forEach((line, i) => {
      if (line.includes('![')) {
        console.log(`라인 ${i + 1}: ${line}`);
      }
    });

    // 파일로도 저장
    fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/article7_content.txt', data.content);
    console.log('\n✅ article7_content.txt에 저장했습니다.');
  }
}

checkImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
