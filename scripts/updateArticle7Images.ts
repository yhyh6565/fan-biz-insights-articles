import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 7;
const articlesDir = '/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles';
const folderName = '조그만 인형, 63억 원어치가 팔린 이유';

async function uploadAndUpdate() {
  console.log('📝 [7] 이미지 업로드 및 캡션 추가 중...\n');

  // 업로드할 이미지들
  const imagesToUpload = [
    { file: '20240621160714_7e687bdb14ab4f9c9101fdf9201a16e8.jpg', storageName: '7-riize-dolls.jpg' },
    { file: 'image.png', storageName: '7-fan-meme-1.png' },
    { file: 'image 1.png', storageName: '7-fan-meme-2.png' },
    { file: 'IMG_0694.jpg', storageName: '7-member-with-doll.jpg' },
    { file: '스크린샷_2025-03-25_오후_3.39.48.png', storageName: '7-kakao-gift.png' },
    { file: 'image 2.png', storageName: '7-restock-notice.png' }
  ];

  const imageUrls: Record<string, string> = {};

  // 이미지 업로드
  for (const img of imagesToUpload) {
    const imagePath = path.join(articlesDir, folderName, img.file);

    if (!fs.existsSync(imagePath)) {
      console.log(`⏭️  ${img.file} 파일을 찾을 수 없습니다.`);
      continue;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const storagePath = `body-images/${img.storageName}`;

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(storagePath, imageBuffer, {
        contentType: img.storageName.endsWith('.png') ? 'image/png' : 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.log(`❌ ${img.file} 업로드 실패:`, uploadError.message);
    } else {
      const { data: urlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(storagePath);

      imageUrls[img.file] = urlData.publicUrl;
      console.log(`✅ ${img.file} 업로드 완료`);
    }
  }

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

  // 이미지 교체 및 캡션 추가
  // 1. 첫 번째 이미지 - 라이즈 멤버별 캐릭터 인형
  content = content.replace(
    /!\[https:\/\/limvajcxxkgleztxrqpx\.supabase\.co\/storage\/v1\/object\/public\/article-images\/body-images\/7-riize-doll-meme\.png\]\(https:\/\/limvajcxxkgleztxrqpx\.supabase\.co\/storage\/v1\/object\/public\/article-images\/body-images\/7-riize-doll-meme\.png\)/g,
    `![라이즈 멤버별 캐릭터 인형](${imageUrls['20240621160714_7e687bdb14ab4f9c9101fdf9201a16e8.jpg']})`
  );

  // 2. 두 번째 이미지 위치 (라인 23 근처) - 팬아트/밈 예시들 추가
  // 기존의 7-riize-doll-sold.png를 팬 밈 이미지들로 교체
  const fanMemesSection = `   - 캐릭터 공개 이후 팬들은 SNS를 통해 **팬아트, 밈(meme), 별명 부여 등 다양한 놀이 콘텐츠**를 자발적으로 제작하고 공유했습니다.

    ![팬들이 만든 캐릭터 밈](${imageUrls['image.png']})

    ![팬들이 만든 캐릭터 밈](${imageUrls['image 1.png']})

    → 굿즈는 단순한 소장품이 아니라, **팬들이 재해석하는 창작과 놀이의 대상**이 되었습니다.

   - 팬들은 멤버를 캐릭터 이름으로 부르고, 멤버들 또한 방송에서 인형을 직접 활용하며 애정을 표현했습니다.

    ![멤버들이 인형을 활용하는 모습](${imageUrls['IMG_0694.jpg']})

    → 이 상호작용은 **굿즈를 중심으로 한 팬덤 내 새로운 커뮤니케이션 문화**를 형성, 굿즈는 **팬덤 유대감을 상징하는 정서적 매개체**로 자리잡았습니다.`;

  // 기존 섹션 교체
  const oldSection = /   - 캐릭터 공개 이후 팬들은 SNS를 통해[\s\S]*?굿즈는 \*\*팬덤 유대감을 상징하는 정서적 매개체\*\*로 자리잡았습니다\./;
  content = content.replace(oldSection, fanMemesSection);

  // 3. 유통 전략 섹션에 이미지 추가
  const distributionSection = `   - SM 엔터테인먼트는 다양한 온라인몰(공식몰, 예스24, Ktown4u 등)과 **오프라인 팝업스토어 및 팬콘서트 현장 판매를 병행**하며 접근성을 높였습니다.
   - 카카오톡 선물하기 등 일상적 접점을 활용해 **신규 팬 유입과 구매 허들을 낮추는 전략**도 병행했습니다.

    ![카카오톡 선물하기 서비스](${imageUrls['스크린샷_2025-03-25_오후_3.39.48.png']})

   - 동시에 "**재입고 일정 미정**" 문구와 **한정 수량 판매**로 긴장감을 조성했고, 이로 인해 출시 직후 전 제품이 **빠르게 완판**,

    ![재입고 일정 미정 공지](${imageUrls['image 2.png']})

    → 2차 거래 시장에서는 프리미엄 가격이 형성되었습니다.`;

  const oldDistribution = /   - SM 엔터테인먼트는 다양한 온라인몰[\s\S]*?→ 2차 거래 시장에서는 프리미엄 가격이 형성되었습니다\./;
  content = content.replace(oldDistribution, distributionSection);

  console.log('\n📝 Supabase에 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 모든 이미지 업로드 및 캡션 추가 완료!');
}

uploadAndUpdate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
