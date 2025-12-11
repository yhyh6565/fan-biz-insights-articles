import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkConclusion() {
  const { data } = await supabase.from('articles').select('content').eq('article_number', 2).single();

  if (data) {
    const lines = data.content.split('\n');
    const conclusionStart = lines.findIndex(l => l.includes('🎯 결론'));
    if (conclusionStart !== -1) {
      console.log('결론 부분:');
      console.log(lines.slice(conclusionStart, conclusionStart + 30).join('\n'));
    }
  }
}

checkConclusion()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
