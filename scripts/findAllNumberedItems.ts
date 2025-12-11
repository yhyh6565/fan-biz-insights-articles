import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function findAll() {
  const { data } = await supabase.from('articles').select('content').eq('article_number', 2).single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('모든 "1. **"로 시작하는 라인들:\n');
    lines.forEach((line, index) => {
      if (/^1\.\s+\*\*/.test(line)) {
        console.log(`라인 ${index + 1}: ${line.substring(0, 80)}...`);
      }
    });
  }
}

findAll()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
