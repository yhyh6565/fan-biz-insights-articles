import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 9;

async function fixImages() {
  console.log('📝 [9] 이미지 렌더링 수정 및 캡션 추가 중...\n');

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
  const lines = content.split('\n');

  // 1. 4개 공백이 있는 이미지 줄들 찾아서 공백 제거
  let fixedSpaces = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const leadingSpaces = line.length - line.trimStart().length;

    // 4개 이상 공백이 있고 이미지 마크다운인 경우
    if (leadingSpaces >= 4 && line.trim().startsWith('![')) {
      lines[i] = line.trim();
      fixedSpaces++;
    }
  }

  content = lines.join('\n');

  if (fixedSpaces > 0) {
    console.log(`✅ ${fixedSpaces}개 이미지의 공백 제거`);
  }

  // 2. 캡션 수정 - 파일명 대신 의미있는 캡션으로 변경
  const captionUpdates = [
    {
      old: '![위시 가정통신문.png](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-8.png)',
      new: '![NCT WISH 위시고등학교 가정통신문](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-8.png)'
    },
    {
      old: '![위시 인스타 프로모션.jpeg](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-7.jpeg)',
      new: '![NCT WISH 인스타그램 DM 형식 스케줄 공지](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-7.jpeg)'
    },
    {
      old: '![인스타그램-@nctwish_official-공지-채널.png](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-6.png)',
      new: '![NCT WISH 인스타그램 공지 채널 시간대별 이름 변경](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-6.png)'
    },
    {
      old: '![IMG_0727.jpg](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-5.jpg)',
      new: '![NCT WISH 헐 맞다 수행 이미지 - 학사일정 안내](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-5.jpg)'
    },
    {
      old: '![인스타그램_@nctwish_official-하이라이트.png](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-4.png)',
      new: '![NCT WISH 인스타그램 하이라이트 - 수행평가 안내](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-4.png)'
    },
    {
      old: '![인스타그램 @nctwish_official](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-3.png)',
      new: '![NCT WISH 고등어 손질하는 방법 패러디 영상](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-3.png)'
    },
    {
      old: '![인스타그램 @nctwish_official](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-2.png)',
      new: '![NCT WISH 너 몇 접시 먹을 거야 챌린지](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-2.png)'
    },
    {
      old: '![스테디 팝업.jpeg](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-1.jpeg)',
      new: '![NCT WISH Steady 팝업스토어 Let\'s Go Steady](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/9-body-9-1.jpeg)'
    }
  ];

  let captionCount = 0;
  for (const update of captionUpdates) {
    if (content.includes(update.old)) {
      content = content.replace(update.old, update.new);
      captionCount++;
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

  console.log('✅ 이미지 렌더링 수정 및 캡션 추가 완료!');
}

fixImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
