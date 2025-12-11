import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkImages() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 8)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('현재 데이터베이스에 있는 이미지:\n');
    lines.forEach((line, i) => {
      if (line.includes('![')) {
        console.log(`라인 ${i + 1}: ${line.substring(0, 100)}...`);
      }
    });

    const imageCount = lines.filter(l => l.includes('![')).length;
    console.log(`\n총 ${imageCount}개의 이미지`);
  }
}

checkImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
