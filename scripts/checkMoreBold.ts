import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkMoreBold() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 8)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('볼드(**) 패턴이 있는 라인들:\n');
    lines.forEach((line, i) => {
      if (line.includes('**') && !line.startsWith('#')) {
        console.log(`라인 ${i + 1}: ${line}`);
      }
    });
  }
}

checkMoreBold()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
