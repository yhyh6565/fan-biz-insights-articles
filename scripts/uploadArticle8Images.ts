import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 8;

async function uploadAndUpdate() {
  console.log('📝 [8] 이미지 업로드 및 추가 중...\n');

  // 이미지 파일 경로 (사용자가 보여준 스크린샷 기준)
  const articleFolder = `/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles/실물 앨범, 이제 ${String.fromCharCode(8216)}기능${String.fromCharCode(8217)}이 아닌 ${String.fromCharCode(8216)}감정${String.fromCharCode(8217)}을 판다`;

  const imagesToUpload = [
    { file: 'image.png', storageName: '8-aespa-cdp-2.png', caption: '에스파 아마겟돈 CDP 앨범' },
    { file: '키_가솔린_vhs_.jpeg', storageName: '8-key-gasoline-vhs.jpg', caption: 'KEY 가솔린 VHS 테이프 버전' },
    { file: '키_가솔린_floppy_.jpeg', storageName: '8-key-gasoline-floppy.jpg', caption: 'KEY 가솔린 플로피 디스크 버전' },
    { file: '키_배드러브.jpg', storageName: '8-key-bad-love-floppy.jpg', caption: 'KEY 배드 러브 플로피 디스크 버전' },
    { file: '키_굿앤그레이트.jpg', storageName: '8-key-good-great-folder.jpg', caption: 'KEY 굿앤그레이트 서류철 버전' },
    { file: '02._NCT_WISH_-_The_1st_Mini_Album__Steady__WICHU_s_Memory_Ver._SMART_ALBUM__album_details_1400x.webp', storageName: '8-nct-wish-camera.webp', caption: 'NCT WISH WICHU\'s Memory 카메라 앨범' }
  ];

  const imageUrls: Record<string, string> = {};

  // 이미지 업로드
  for (const img of imagesToUpload) {
    const imagePath = path.join(articleFolder, img.file);

    if (!fs.existsSync(imagePath)) {
      console.log(`⏭️  ${img.file} 파일을 찾을 수 없습니다.`);
      continue;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const storagePath = `body-images/${img.storageName}`;

    const ext = path.extname(img.storageName).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(storagePath, imageBuffer, {
        contentType,
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

  // 이미지 삽입
  // 1. 에스파 CDP 섹션에 추가 이미지 (라인 36 다음)
  if (imageUrls['image.png']) {
    const cdpSection = `![https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/8-aespa-cdp.png](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/8-aespa-cdp.png)

**CDP 앨범이라는 전례 없는 실험**`;

    const newCdpSection = `![에스파 아마겟돈 CDP 앨범](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/8-aespa-cdp.png)

![${imagesToUpload.find(img => img.file === 'image.png')?.caption}](${imageUrls['image.png']})

**CDP 앨범이라는 전례 없는 실험**`;

    content = content.replace(cdpSection, newCdpSection);
    console.log('\n✅ 에스파 CDP 이미지 추가');
  }

  // 2. KEY 가솔린 섹션 (VHS와 플로피 이미지)
  const keyGasolineSection = `**VHS 테이프와 플로피 디스크로 구현한 앨범**

   - 2022년 발매된 KEY의 '가솔린' 앨범은 **VHS 테이프** 형태로 제작되었으며, 1집 '배드 러브'는 **플로피 디스크** 형태로 출시되었습니다.`;

  if (imageUrls['키_가솔린_vhs_.jpeg'] && imageUrls['키_가솔린_floppy_.jpeg'] && imageUrls['키_배드러브.jpg']) {
    const newKeySection = `**VHS 테이프와 플로피 디스크로 구현한 앨범**

![KEY 가솔린 VHS 테이프 버전](${imageUrls['키_가솔린_vhs_.jpeg']})

![KEY 가솔린 플로피 디스크 버전](${imageUrls['키_가솔린_floppy_.jpeg']})

![KEY 배드 러브 플로피 디스크 버전](${imageUrls['키_배드러브.jpg']})

   - 2022년 발매된 KEY의 '가솔린' 앨범은 **VHS 테이프** 형태로 제작되었으며, 1집 '배드 러브'는 **플로피 디스크** 형태로 출시되었습니다.`;

    content = content.replace(keyGasolineSection, newKeySection);
    console.log('✅ KEY 가솔린/배드러브 이미지 3개 추가');
  }

  // 3. KEY 굿앤그레이트 섹션 (서류철 이미지)
  const keyGoodSection = `**일반적인 앨범 패키징을 넘어선 서류철 디자인**

   - 2023년 발매된 KEY의 2집 미니앨범 'Good & Great'는 **서류철 형태**로 디자인되었습니다.`;

  if (imageUrls['키_굿앤그레이트.jpg']) {
    const newGoodSection = `**일반적인 앨범 패키징을 넘어선 서류철 디자인**

![KEY 굿앤그레이트 서류철 버전](${imageUrls['키_굿앤그레이트.jpg']})

   - 2023년 발매된 KEY의 2집 미니앨범 'Good & Great'는 **서류철 형태**로 디자인되었습니다.`;

    content = content.replace(keyGoodSection, newGoodSection);
    console.log('✅ KEY 굿앤그레이트 이미지 추가');
  }

  // 4. NCT WISH 섹션 (카메라 이미지)
  const nctSection = `**스마트 앨범, 장난감같은 앨범**

   - NCT WISH의 '[WICHU's Memory](https://namu.wiki/w/Steady(NCT%20WISH%20%EB%AF%B8%EB%8B%88%20%EC%95%A8%EB%B2%94))' 버전 앨범은 **휴대용 카메라 장난감 형태**로 출시되었습니다.`;

  if (imageUrls['02._NCT_WISH_-_The_1st_Mini_Album__Steady__WICHU_s_Memory_Ver._SMART_ALBUM__album_details_1400x.webp']) {
    const newNctSection = `**스마트 앨범, 장난감같은 앨범**

![NCT WISH WICHU's Memory 카메라 앨범](${imageUrls['02._NCT_WISH_-_The_1st_Mini_Album__Steady__WICHU_s_Memory_Ver._SMART_ALBUM__album_details_1400x.webp']})

   - NCT WISH의 '[WICHU's Memory](https://namu.wiki/w/Steady(NCT%20WISH%20%EB%AF%B8%EB%8B%88%20%EC%95%A8%EB%B2%94))' 버전 앨범은 **휴대용 카메라 장난감 형태**로 출시되었습니다.`;

    content = content.replace(nctSection, newNctSection);
    console.log('✅ NCT WISH 이미지 추가');
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

  console.log('✅ 모든 이미지 업로드 및 추가 완료!');
}

uploadAndUpdate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
