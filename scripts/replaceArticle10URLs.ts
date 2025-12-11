import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 10;

async function replaceURLs() {
  console.log('📝 [10] 이미지 URL 및 캡션 교체 중...\n');

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

  // URL 및 캡션 교체
  const replacements = [
    {
      // 스크린샷 2025-03-29 오후 1.10.03.png
      old: /!\[스크린샷 2025-03-29 오후 1\.10\.03\.png\]\([^)]+\)/g,
      new: '![f(x) 앨범 콘셉트](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-albums.png)',
      desc: 'f(x) 앨범 콘셉트'
    },
    {
      // 에프엑스 핑크테이프.jpg
      old: /!\[에프엑스 핑크테이프\.jpg\]\([^)]+\)/g,
      new: '![f(x) Pink Tape 앨범](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-pink-tape.jpg)',
      desc: 'f(x) Pink Tape 앨범'
    },
    {
      // 에프엑스.jpeg - 첫번째
      old: /!\[에프엑스\.jpeg\]\([^)]+\)/,
      new: '![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-1.jpg)',
      desc: 'f(x) Pink Tape 아트 필름 1'
    },
    {
      // 에프엑스2.jpeg
      old: /!\[에프엑스2\.jpeg\]\([^)]+\)/g,
      new: '![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-2.jpg)',
      desc: 'f(x) Pink Tape 아트 필름 2'
    },
    {
      // 다운로드.jpeg
      old: /!\[다운로드\.jpeg\]\([^)]+\)/g,
      new: '![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-3.jpg)',
      desc: 'f(x) Pink Tape 아트 필름 3'
    },
    {
      // 스크린샷 2025-03-29 오후 1.17.27.png
      old: /!\[스크린샷 2025-03-29 오후 1\.17\.27\.png\]\([^)]+\)/g,
      new: '![EXO Monster 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-monster-logo.png)',
      desc: 'EXO Monster 로고'
    },
    {
      // 스크린샷 2025-03-29 오후 1.17.21.png
      old: /!\[스크린샷 2025-03-29 오후 1\.17\.21\.png\]\([^)]+\)/g,
      new: '![EXO Lucky One 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-lucky-one-logo.png)',
      desc: 'EXO Lucky One 로고'
    },
    {
      // 엔시티 스타벅스.jpg
      old: /!\[엔시티 스타벅스\.jpg\]\([^)]+\)/g,
      new: '![NCT 스타벅스 협업 굿즈](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-nct-starbucks.jpg)',
      desc: 'NCT 스타벅스 협업 굿즈'
    }
  ];

  let replacedCount = 0;
  for (const r of replacements) {
    if (content.match(r.old)) {
      content = content.replace(r.old, r.new);
      replacedCount++;
      console.log(`✅ ${r.desc}`);
    }
  }

  console.log(`\n총 ${replacedCount}개 이미지 교체`);

  console.log('\n📝 Supabase DB 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 모든 이미지 URL 및 캡션 교체 완료!');
}

replaceURLs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
