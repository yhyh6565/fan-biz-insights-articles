import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateDate() {
  console.log('📝 [9] 팬은 기다림도 소비한다 - 업로드 일자 수정 중...');

  const { data, error } = await supabase
    .from('articles')
    .update({ published_at: '2025-04-03' })
    .eq('article_number', 9)
    .select();

  if (error) {
    console.log('❌ 업데이트 실패:', error.message);
    process.exit(1);
  }

  console.log('✅ 업로드 일자 업데이트 성공!');
  console.log('📅 새로운 일자: 2025-04-03');
  if (data && data.length > 0) {
    console.log('📄 글 ID:', data[0].id);
  }
}

updateDate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
