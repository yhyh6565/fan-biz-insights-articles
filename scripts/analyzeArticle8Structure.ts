import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function analyze() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 8)
    .single();

  if (data) {
    fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/article8_full.txt', data.content);

    const lines = data.content.split('\n');

    console.log('Article 8 구조 분석:\n');
    lines.forEach((line, i) => {
      if (line.startsWith('##') || line.includes('CDP') || line.includes('VHS') || line.includes('플로피') || line.includes('서류철') || line.includes('NCT') || line.includes('![')||line.includes('KEY')) {
        console.log(`라인 ${i + 1}: ${line.substring(0, 100)}`);
      }
    });

    console.log('\n✅ article8_full.txt에 전체 내용 저장');
  }
}

analyze()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
