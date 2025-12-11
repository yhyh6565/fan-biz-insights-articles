import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 10;

async function uploadImages() {
  console.log('📝 [10] 이미지 업로드 및 URL 교체 중...\n');

  // 폴더 경로 - 사전 저장된 경로 파일에서 읽기
  const pathFile = '/tmp/article10_path.txt';
  if (!fs.existsSync(pathFile)) {
    console.error('❌ 경로 파일을 찾을 수 없습니다:', pathFile);
    process.exit(1);
  }

  const articleFolder = fs.readFileSync(pathFile, 'utf-8').trim();

  if (!fs.existsSync(articleFolder)) {
    console.error('❌ 폴더를 찾을 수 없습니다:', articleFolder);
    process.exit(1);
  }

  console.log(`📁 폴더: ${articleFolder}\n`);

  // 업로드할 이미지 목록
  const imagesToUpload = [
    {
      localFile: '스크린샷_2025-03-29_오후_1.10.03.png',
      storageName: '10-fx-albums.png',
      oldPattern: /!\[f\(x\) 앨범 콘셉트\]\([^)]+스크린샷_2025-03-29_오후_1\.10\.03\.png\)/g,
      newMarkdown: '![f(x) 앨범 콘셉트](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-albums.png)'
    },
    {
      localFile: '에프엑스_핑크테이프.jpg',
      storageName: '10-fx-pink-tape.jpg',
      oldPattern: /!\[f\(x\) Pink Tape 앨범\]\([^)]+에프엑스_핑크테이프\.jpg\)/g,
      newMarkdown: '![f(x) Pink Tape 앨범](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-pink-tape.jpg)'
    },
    {
      localFile: '에프엑스.jpeg',
      storageName: '10-fx-art-film-1.jpg',
      oldPattern: /!\[f\(x\) Pink Tape 아트 필름\]\([^)]+에프엑스\.jpeg\)/g,
      newMarkdown: '![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-1.jpg)'
    },
    {
      localFile: '에프엑스2.jpeg',
      storageName: '10-fx-art-film-2.jpg',
      oldPattern: /!\[f\(x\) Pink Tape 아트 필름\]\([^)]+에프엑스2\.jpeg\)/g,
      newMarkdown: '![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-2.jpg)'
    },
    {
      localFile: '다운로드.jpeg',
      storageName: '10-fx-art-film-3.jpg',
      oldPattern: /!\[f\(x\) Pink Tape 아트 필름\]\([^)]+다운로드\.jpeg\)/g,
      newMarkdown: '![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-3.jpg)'
    },
    {
      localFile: 'SFSy47Rc5tQiS-aKtzmjxw0KelP4N-vroZW5tyxrhN9oZ8ZY10oqwFzt1oRgsWeU76YSOfZu3dbCI6OnXQsuURuToVlGsnKSPkI5UNZxe4VLEKiqgLfZ6Q6sbM6vaF4xUT8rjS8hGI1JYHhqu9W3QQ.png',
      storageName: '10-exo-overdose-logo.png',
      // 이미 업로드되어 있음
      skip: true
    },
    {
      localFile: '스크린샷_2025-03-29_오후_1.17.27.png',
      storageName: '10-exo-monster-logo.png',
      oldPattern: /!\[EXO Monster 로고\]\([^)]+스크린샷_2025-03-29_오후_1\.17\.27\.png\)/g,
      newMarkdown: '![EXO Monster 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-monster-logo.png)'
    },
    {
      localFile: '스크린샷_2025-03-29_오후_1.17.21.png',
      storageName: '10-exo-lucky-one-logo.png',
      oldPattern: /!\[EXO Lucky One 로고\]\([^)]+스크린샷_2025-03-29_오후_1\.17\.21\.png\)/g,
      newMarkdown: '![EXO Lucky One 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-lucky-one-logo.png)'
    },
    {
      localFile: '엔시티_스타벅스.jpg',
      storageName: '10-nct-starbucks.jpg',
      oldPattern: /!\[NCT 스타벅스 협업 굿즈\]\([^)]+엔시티_스타벅스\.jpg\)/g,
      newMarkdown: '![NCT 스타벅스 협업 굿즈](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-nct-starbucks.jpg)'
    }
  ];

  // 이미지 업로드
  for (const img of imagesToUpload) {
    if (img.skip) {
      console.log(`⏭️  ${img.localFile} - 이미 업로드됨`);
      continue;
    }

    const imagePath = path.join(articleFolder, img.localFile);

    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  ${img.localFile} 파일을 찾을 수 없습니다.`);
      continue;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const storagePath = `body-images/${img.storageName}`;

    const ext = path.extname(img.storageName).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.log(`❌ ${img.localFile} 업로드 실패:`, uploadError.message);
    } else {
      console.log(`✅ ${img.localFile} → ${img.storageName}`);
    }
  }

  // 콘텐츠 가져오기
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

  // URL 교체
  console.log('\n📝 이미지 URL 교체 중...');
  let replacedCount = 0;

  for (const img of imagesToUpload) {
    if (img.skip || !img.oldPattern || !img.newMarkdown) continue;

    const matches = content.match(img.oldPattern);
    if (matches) {
      content = content.replace(img.oldPattern, img.newMarkdown);
      replacedCount++;
      console.log(`  ✅ ${img.localFile} URL 교체`);
    }
  }

  console.log(`\n총 ${replacedCount}개 이미지 URL 교체 완료`);

  // DB 업데이트
  console.log('\n📝 Supabase DB 업데이트 중...');

  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 모든 이미지 업로드 및 URL 교체 완료!');
}

uploadImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
