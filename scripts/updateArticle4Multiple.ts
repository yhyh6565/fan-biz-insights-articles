import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 4;

async function updateArticle4() {
  console.log('📝 [4] 우리끼리만의 소통으로 1억 유저 모으기 (1) 수정 중...\n');

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

  // 현재 내용을 파일로 저장해서 확인
  fs.writeFileSync('/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/scripts/article4_current.txt', content);
  console.log('✅ 현재 내용을 article4_current.txt에 저장했습니다.');

  // 1. '특히 K-POP 팬덤은 단순한 소비자가 아니라, **아티스트와 '독점적인 소통'을 원하는 '참여자'**입니다' 문장에서 '**' 제거
  content = content.replace(
    /특히 K-POP 팬덤은 단순한 소비자가 아니라, \*\*아티스트와 '독점적인 소통'을 원하는 '참여자'\*\*입니다/g,
    "특히 K-POP 팬덤은 단순한 소비자가 아니라, 아티스트와 '독점적인 소통'을 원하는 '참여자'입니다"
  );
  console.log('✅ 1. Bold 제거 완료');

  // 2. 호텔 및 여행 산업의 표 수정
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

  const newTable = `| 멤버십 등급 | 조건 | 혜택 |
| --- | --- | --- |
| 실버 엘리트 (Silver Elite) | 연간 10 ~ 24박 투숙 시 | 투숙 당 10% 보너스 포인트 적립, 레이트 체크아웃 우대 |
| 골드 엘리트 (Gold Elite) | 연간 25 ~ 49박 투숙 시 | 투숙 당 25% 보너스 포인트 적립, 객실 업그레이드, 오후 2시 레이트 체크아웃 |
| 플래티넘 엘리트 (Platinum Elite) | 연간 50 ~ 74박 투숙 시 | 투숙 당 50% 보너스 포인트 적립, 스위트룸 포함 객실 업그레이드, 클럽 라운지 이용, 오후 4시 레이트 체크 아웃 등 |
| 앰버서더 엘리트 (Ambassador Elite) | 연간 100박 이상 투숙, 일정 금액 이상 지출 시 | 개인 전담 직원 서비스, 체크인/체크아웃 시간 자유 선택 |`;

  content = content.replace(oldTable, newTable);
  console.log('✅ 2. 표 형식 수정 완료');

  // 3. 전략적 시사점 및 결론 파트 줄바꿈 추가
  content = content.replace(
    /1️⃣ 팬덤뿐만 아니라 모든 비즈니스에서 \*\*독점성과 감정적 욕구의 결합\*\*은 강력한 충성도를 만듭니다.\n2️⃣ '특별한 경험'을 통해 고객의 정서적 유대와 브랜드 가치를 높이는 브랜드의 경쟁력이 될 수 있습니다\. \n3️⃣ 엔터 산업에서는 \*\*정서적 연결이 핵심 자산\*\*이므로, 이를 가능하게 할 소통 채널 설계가 중요합니다\./g,
    `1️⃣ 팬덤뿐만 아니라 모든 비즈니스에서 **독점성과 감정적 욕구의 결합**은 강력한 충성도를 만듭니다.

2️⃣ '특별한 경험'을 통해 고객의 정서적 유대와 브랜드 가치를 높이는 브랜드의 경쟁력이 될 수 있습니다.

3️⃣ 엔터 산업에서는 **정서적 연결이 핵심 자산**이므로, 이를 가능하게 할 소통 채널 설계가 중요합니다.`
  );
  console.log('✅ 3. 전략적 시사점 및 결론 파트 줄바꿈 추가 완료');

  console.log('\n📝 Supabase에 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 모든 수정 완료!');
  process.exit(0);
}

updateArticle4()
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
