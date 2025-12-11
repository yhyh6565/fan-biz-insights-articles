import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 10;

async function fixCaptions() {
  console.log('📝 [10] 이미지 캡션 수정 중...\n');

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

  // 로컬 경로를 가리키는 이미지들의 캡션 수정
  const captionUpdates = [
    {
      pattern: /!\[스크린샷 2025-03-29 오후 1\.10\.03\.png\]/g,
      replacement: `![f(x) 앨범 콘셉트]`
    },
    {
      pattern: /!\[에프엑스 핑크테이프\.jpg\]/g,
      replacement: `![f(x) Pink Tape 앨범]`
    },
    {
      pattern: /!\[에프엑스\.jpeg\]/g,
      replacement: `![f(x) Pink Tape 아트 필름]`
    },
    {
      pattern: /!\[에프엑스2\.jpeg\]/g,
      replacement: `![f(x) Pink Tape 아트 필름]`
    },
    {
      pattern: /!\[다운로드\.jpeg\]/g,
      replacement: `![f(x) Pink Tape 아트 필름]`
    },
    {
      pattern: /!\[스크린샷 2025-03-29 오후 1\.17\.27\.png\]/g,
      replacement: `![EXO Monster 로고]`
    },
    {
      pattern: /!\[스크린샷 2025-03-29 오후 1\.17\.21\.png\]/g,
      replacement: `![EXO Lucky One 로고]`
    },
    {
      pattern: /!\[엔시티 스타벅스\.jpg\]/g,
      replacement: `![NCT 스타벅스 협업 굿즈]`
    }
  ];

  let captionCount = 0;
  for (const update of captionUpdates) {
    const matches = content.match(update.pattern);
    if (matches) {
      content = content.replace(update.pattern, update.replacement);
      captionCount += matches.length;
    }
  }

  if (captionCount > 0) {
    console.log(`✅ ${captionCount}개 이미지의 캡션 수정`);
  }

  console.log('\n📝 Supabase에 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 캡션 수정 완료!');
  console.log('\n⚠️  참고: 일부 이미지는 아직 로컬 경로를 참조하고 있습니다.');
  console.log('이미지 파일을 Supabase Storage에 업로드해야 제대로 표시됩니다.');
}

fixCaptions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
