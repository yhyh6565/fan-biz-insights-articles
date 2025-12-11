import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function findSentences() {
  const { data } = await supabase
    .from('articles')
    .select('content, article_number, title')
    .eq('article_number', 5)
    .single();

  if (data) {
    console.log('Article:', data.title);
    console.log('\n문장 1 찾기:');

    const lines = data.content.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('하이브는') || line.includes('디지털 팬덤 인프라')) {
        console.log(`라인 ${i + 1}: ${line}`);
      }
    });

    console.log('\n문장 2 찾기:');
    lines.forEach((line, i) => {
      if (line.includes('이처럼 세 플랫폼은')) {
        console.log(`라인 ${i + 1}: ${line}`);
      }
    });
  }
}

findSentences()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
