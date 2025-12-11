import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkArrows() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 7)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('화살표(→)로 시작하는 라인들:\n');
    lines.forEach((line, i) => {
      if (line.includes('→')) {
        const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
        console.log(`라인 ${i + 1} (공백 ${leadingSpaces}칸): ${line.substring(0, 100)}...`);
      }
    });
  }
}

checkArrows()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
