import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function extractLines() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 4)
    .single();

  if (data) {
    const lines = data.content.split('\n');

    console.log('라인 85:');
    console.log(lines[84]);
    console.log('\n라인 86:');
    console.log(lines[85]);
    console.log('\n라인 87:');
    console.log(lines[86]);
  }
}

extractLines()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
