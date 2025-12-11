import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 4;

async function removeDoubleCaption() {
  console.log('📝 [4] 중복 캡션 제거 중...\n');

  // 현재 콘텐츠 가져오기
  const { data: article, error: fetchError } = await supabase
    .from('articles')
    .select('content')
    .eq('article_number', ARTICLE_NUMBER)
    .single();

  if (fetchError || !article) {
    console.error('❌ 글을 찾을 수 없습니다:', fetchError?.message);
    process.exit(1);
  }

  let content = article.content;

  // 첫 번째 이미지 후 중복 캡션 제거
  content = content.replace(
    /!\[클럽하우스 앱 화면\]\(https:\/\/[^\)]+\)\n\n\*클럽하우스 앱 화면\*/g,
    '![클럽하우스 앱 화면](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/article-images/4-clubhouse.png)'
  );

  // 두 번째 이미지 후 중복 캡션 제거
  content = content.replace(
    /!\[메리어트 본보이 멤버십 혜택 안내\]\(https:\/\/[^\)]+\)\n\n\*메리어트 본보이 멤버십 혜택 안내\*/g,
    '![메리어트 본보이 멤버십 혜택 안내](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/article-images/4-marriott-bonvoy.png)'
  );

  console.log('📝 Supabase에 업데이트 중...');

  // Supabase 업데이트
  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 중복 캡션 제거 완료!');
}

removeDoubleCaption()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
