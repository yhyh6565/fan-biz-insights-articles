import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 8;

async function fixArticle8() {
  console.log('📝 [8] 화살표 및 불필요한 볼드 수정 중...\n');

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

  // 현재 내용 저장
  fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/article8_before.txt', content);

  const lines = content.split('\n');
  let arrowCount = 0;

  // 1. 화살표로 시작하는 라인의 앞 공백 제거 (4칸 이상인 경우)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;

    if (leadingSpaces >= 4 && line.trim().startsWith('→')) {
      lines[i] = line.trim();
      arrowCount++;
      console.log(`✅ 라인 ${i + 1} 화살표 공백 제거`);
    }
  }

  content = lines.join('\n');

  // 2. 불필요한 볼드 제거
  let boldCount = 0;

  // 패턴: 문장 중간에 [**로 시작하고 **]로 끝나는 경우 (링크와 볼드가 섞인 경우)
  const pattern1 = /\[(\*\*[^\]]+\*\*)\]/g;
  const matches1 = content.match(pattern1);
  if (matches1) {
    content = content.replace(pattern1, (match, group) => {
      boldCount++;
      return `[${group.replace(/\*\*/g, '')}]`;
    });
    console.log(`✅ 링크 안 볼드 ${matches1.length}개 제거`);
  }

  // 패턴: **YES24를 포함한 주요 음반몰에서 전량 품절** 형태
  // "**...되었습니다", "**...했습니다" 등 문장 끝에 볼드가 있는 경우
  const pattern2 = /\*\*([^*]+되었습니다|[^*]+했습니다)\*\*/g;
  const matches2 = content.match(pattern2);
  if (matches2) {
    content = content.replace(pattern2, '$1');
    console.log(`✅ 문장 끝 볼드 ${matches2.length}개 제거`);
    boldCount += matches2.length;
  }

  // 패턴: **"..."** 형태 (인용구에 볼드)
  const pattern3 = /\*\*"([^"]+)"\*\*/g;
  const matches3 = content.match(pattern3);
  if (matches3) {
    content = content.replace(pattern3, '"$1"');
    console.log(`✅ 인용구 볼드 ${matches3.length}개 제거`);
    boldCount += matches3.length;
  }

  console.log(`\n총 ${arrowCount}개 화살표 라인, ${boldCount}개 볼드 수정`);
  console.log('\n📝 Supabase에 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  // 수정 후 내용 저장
  fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/article8_after.txt', content);

  console.log('✅ 수정 완료!');
  console.log('📄 수정 전: article8_before.txt');
  console.log('📄 수정 후: article8_after.txt');
}

fixArticle8()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
