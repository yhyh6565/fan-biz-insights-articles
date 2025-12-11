import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkBold() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 4)
    .single();

  if (data) {
    const lines = data.content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('특히 K-POP')) {
        console.log(`라인 ${index + 1}: ${line}`);
      }
    });
  }
}

checkBold()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
