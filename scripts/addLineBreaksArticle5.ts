import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 5;

async function addLineBreaks() {
  console.log('📝 [5] 줄바꿈 추가 중...\n');

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

  // 1. "그 결과 하이브는 **K-POP 산업 전체를 관통하는 디지털 팬덤 인프라의 주도권**을 확보하게 되었습니다." 뒤에 줄바꿈
  const sentence1 = "그 결과 하이브는 **K-POP 산업 전체를 관통하는 디지털 팬덤 인프라의 주도권**을 확보하게 되었습니다.";

  // 현재 이 문장이 어떤 컨텍스트에 있는지 확인
  const lines = content.split('\n');
  const line125Idx = lines.findIndex(l => l.includes('그 결과 하이브는'));

  if (line125Idx !== -1) {
    console.log(`라인 ${line125Idx + 1}: ${lines[line125Idx]}`);
    console.log(`라인 ${line125Idx + 2}: ${lines[line125Idx + 1]}`);

    // 빈 줄 하나 더 추가 (총 두 줄 띄우기)
    if (lines[line125Idx + 1] && lines[line125Idx + 1].trim() === '') {
      // 이미 빈 줄이 하나 있으면, 하나 더 추가
      lines.splice(line125Idx + 1, 0, '');
      console.log('✅ 문장 1 뒤에 빈 줄 하나 더 추가 (총 2줄)');
    } else if (lines[line125Idx + 1] && lines[line125Idx + 1].trim() !== '') {
      // 빈 줄이 없으면, 두 개 추가
      lines.splice(line125Idx + 1, 0, '', '');
      console.log('✅ 문장 1 뒤에 빈 줄 2개 추가');
    }
  }

  // 2. "이처럼 세 플랫폼은 **'독점적인 팬 경험'을 어떻게 구체적 기능과 구조로 구현했는지** 보여주며, 팬덤 비즈니스의 전략적 진화를 잘 설명합니다." 뒤에 줄바꿈
  const line135Idx = lines.findIndex(l => l.includes('이처럼 세 플랫폼은'));

  if (line135Idx !== -1) {
    console.log(`\n라인 ${line135Idx + 1}: ${lines[line135Idx]}`);
    console.log(`라인 ${line135Idx + 2}: ${lines[line135Idx + 1]}`);

    // 빈 줄 하나 더 추가 (총 두 줄 띄우기)
    if (lines[line135Idx + 1] && lines[line135Idx + 1].trim() === '') {
      // 이미 빈 줄이 하나 있으면, 하나 더 추가
      lines.splice(line135Idx + 1, 0, '');
      console.log('✅ 문장 2 뒤에 빈 줄 하나 더 추가 (총 2줄)');
    } else if (lines[line135Idx + 1] && lines[line135Idx + 1].trim() !== '') {
      // 빈 줄이 없으면, 두 개 추가
      lines.splice(line135Idx + 1, 0, '', '');
      console.log('✅ 문장 2 뒤에 빈 줄 2개 추가');
    }
  }

  content = lines.join('\n');

  console.log('\n📝 Supabase에 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 콘텐츠 업데이트 완료!');
}

addLineBreaks()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
