import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function debug() {
  const { data } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', 5)
    .single();

  if (data) {
    const lines = data.content.split('\n');
    const line125Idx = lines.findIndex(l => l.includes('그 결과 하이브는'));

    console.log('문장 1 주변:');
    console.log(`라인 ${line125Idx + 1}: "${lines[line125Idx]}"`);
    console.log(`라인 ${line125Idx + 2}: "${lines[line125Idx + 1]}"`);
    console.log(`라인 ${line125Idx + 3}: "${lines[line125Idx + 2]}"`);

    console.log(`\n다음 줄이 빈 줄인가? ${lines[line125Idx + 1].trim() === ''}`);
    console.log(`다음 줄 길이: ${lines[line125Idx + 1].length}`);

    const line135Idx = lines.findIndex(l => l.includes('이처럼 세 플랫폼은'));

    console.log('\n문장 2 주변:');
    console.log(`라인 ${line135Idx + 1}: "${lines[line135Idx]}"`);
    console.log(`라인 ${line135Idx + 2}: "${lines[line135Idx + 1]}"`);
    console.log(`라인 ${line135Idx + 3}: "${lines[line135Idx + 2]}"`);

    console.log(`\n다음 줄이 빈 줄인가? ${lines[line135Idx + 1].trim() === ''}`);
    console.log(`다음 줄 길이: ${lines[line135Idx + 1].length}`);
  }
}

debug()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
