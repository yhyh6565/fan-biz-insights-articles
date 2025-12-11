import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 10;
const MAX_WIDTH = 800; // 최대 너비

async function uploadMissingImages() {
  console.log('📝 [10] 누락된 이미지 업로드 및 전체 이미지 크기 조정 중...\n');

  // 폴더 경로
  const pathFile = '/tmp/article10_path.txt';
  const articleFolder = fs.readFileSync(pathFile, 'utf-8').trim();

  // 누락된 이미지 업로드
  const missingImages = [
    { file: 'f(x)-4_Walls.jpg', storageName: '10-fx-4walls.jpg', caption: 'f(x) 4 Walls 앨범' },
    { file: 'd9gym8q-18b2d293-c1c8-467a-a9de-28b35be6c435.jpg', storageName: '10-fx-4walls-concept.jpg', caption: 'f(x) 4 Walls 콘셉트' },
    { file: 'd8wvxie-9982dcc7-a2ce-4037-9b8a-0b402ab58fe5.jpg', storageName: '10-exo-mama-logo.jpg', caption: 'EXO MAMA 로고' },
    { file: 'SFSy47Rc5tQiS-aKtzmjxw0KelP4N-vroZW5tyxrhN9oZ8ZY10oqwFzt1oRgsWeU76YSOfZu3dbCI6OnXQsuURuToVlGsnKSPkI5UNZxe4VLEKiqgLfZ6Q6sbM6vaF4xUT8rjS8hGI1JYHhqu9W3QQ.png', storageName: '10-exo-overdose-logo.png', caption: 'EXO Overdose 미로 로고' }
  ];

  for (const img of missingImages) {
    const imagePath = path.join(articleFolder, img.file);

    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  ${img.file} 파일을 찾을 수 없습니다.`);
      continue;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const storagePath = `body-images/${img.storageName}`;

    const ext = path.extname(img.storageName).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    // 이미지 크기 조정
    let processedBuffer;
    try {
      const metadata = await sharp(imageBuffer).metadata();
      if (metadata.width && metadata.width > MAX_WIDTH) {
        processedBuffer = await sharp(imageBuffer)
          .resize(MAX_WIDTH, null, { withoutEnlargement: true })
          .toBuffer();
        console.log(`  📐 ${img.file} 크기 조정: ${metadata.width}px → ${MAX_WIDTH}px`);
      } else {
        processedBuffer = imageBuffer;
      }
    } catch (err) {
      console.log(`  ⚠️  ${img.file} 크기 조정 실패, 원본 사용`);
      processedBuffer = imageBuffer;
    }

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(storagePath, processedBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.log(`❌ ${img.file} 업로드 실패:`, uploadError.message);
    } else {
      console.log(`✅ ${img.file} → ${img.storageName}`);
    }
  }

  // 기존 업로드된 이미지들도 크기 조정
  console.log('\n📐 기존 이미지 크기 조정 중...\n');

  const existingImages = [
    '10-fx-albums.png',
    '10-fx-pink-tape.jpg',
    '10-fx-art-film-1.jpg',
    '10-fx-art-film-2.jpg',
    '10-fx-art-film-3.jpg',
    '10-exo-monster-logo.png',
    '10-exo-lucky-one-logo.png',
    '10-nct-starbucks.jpg'
  ];

  for (const storageName of existingImages) {
    const storagePath = `body-images/${storageName}`;

    // 다운로드
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('article-images')
      .download(storagePath);

    if (downloadError) {
      console.log(`⏭️  ${storageName} 다운로드 실패`);
      continue;
    }

    const buffer = Buffer.from(await downloadData.arrayBuffer());

    // 크기 조정
    let processedBuffer;
    try {
      const metadata = await sharp(buffer).metadata();
      if (metadata.width && metadata.width > MAX_WIDTH) {
        processedBuffer = await sharp(buffer)
          .resize(MAX_WIDTH, null, { withoutEnlargement: true })
          .toBuffer();
        console.log(`  📐 ${storageName} 크기 조정: ${metadata.width}px → ${MAX_WIDTH}px`);

        // 재업로드
        const ext = path.extname(storageName).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(storagePath, processedBuffer, {
            contentType,
            upsert: true
          });

        if (!uploadError) {
          console.log(`✅ ${storageName} 크기 조정 완료`);
        }
      } else {
        console.log(`⏭️  ${storageName} 이미 적절한 크기 (${metadata.width}px)`);
      }
    } catch (err) {
      console.log(`⚠️  ${storageName} 처리 실패`);
    }
  }

  console.log('\n✅ 모든 이미지 업로드 및 크기 조정 완료!');
}

uploadMissingImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
