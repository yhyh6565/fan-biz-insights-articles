import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 4;

async function fixTable() {
  console.log('📝 [4] 표 수정 중...\n');

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

  // 현재 잘못된 표
  const oldTable = `| 멤버십 등급 | 조건 | 혜택 |
| --- | --- | --- |
| 실버 엘리트
(Silver Elite) | 연간 10 ~ 24박 투숙 시 | 투숙 당 10% 보너스 포인트 적립, 레이트 체크아웃 우대 |
| 골드 엘리트
(Gold Elite) | 연간 25 ~ 49박 투숙 시 | 투숙 당 25% 보너스 포인트 적립, 객실 업그레이드,
오후 2시 레이트 체크아웃 |
| 플래티넘 엘리트
(Platinum Elite) | 연간 50 ~ 74박 투숙 시 | 투숙 당 50% 보너스 포인트 적립, 스위트룸 포함 객실 업그레이드, 클럽 라운지 이용, 오후 4시 레이트 체크 아웃 등 |
| 앰버서더 엘리트
(Ambassador Elite) | 연간 100박 이상 투숙, 일정 금액 이상 지출 시 | 개인 전담 직원 서비스, 체크인/체크아웃 시간 자유 선택  |`;

  // 올바른 표
  const newTable = `| 멤버십 등급 | 조건 | 혜택 |
| --- | --- | --- |
| 실버 엘리트 (Silver Elite) | 연간 10 ~ 24박 투숙 시 | 투숙 당 10% 보너스 포인트 적립, 레이트 체크아웃 우대 |
| 골드 엘리트 (Gold Elite) | 연간 25 ~ 49박 투숙 시 | 투숙 당 25% 보너스 포인트 적립, 객실 업그레이드, 오후 2시 레이트 체크아웃 |
| 플래티넘 엘리트 (Platinum Elite) | 연간 50 ~ 74박 투숙 시 | 투숙 당 50% 보너스 포인트 적립, 스위트룸 포함 객실 업그레이드, 클럽 라운지 이용, 오후 4시 레이트 체크 아웃 등 |
| 앰버서더 엘리트 (Ambassador Elite) | 연간 100박 이상 투숙, 일정 금액 이상 지출 시 | 개인 전담 직원 서비스, 체크인/체크아웃 시간 자유 선택 |`;

  if (content.includes(oldTable)) {
    content = content.replace(oldTable, newTable);
    console.log('✅ 표 수정 완료');
  } else {
    console.log('❌ 해당 표를 찾을 수 없습니다.');
    process.exit(1);
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

  console.log('✅ 콘텐츠 업데이트 완료!');
}

fixTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
