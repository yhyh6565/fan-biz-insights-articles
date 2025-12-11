import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// Supabase 클라이언트 설정
const SUPABASE_URL = "https://limvajcxxkgleztxrqpx.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadThumbnails() {
  try {
    console.log('📚 메타데이터 CSV 파일 읽는 중...');

    // CSV 파일 읽기
    const csvPath = path.join(process.cwd(), '메타데이터.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    });

    console.log(`✅ ${records.length}개의 글 발견\n`);

    // Supabase Storage 버킷 확인
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === 'article-images');

    if (!bucketExists) {
      console.log('📦 article-images 버킷 생성 중...');
      const { error } = await supabase.storage.createBucket('article-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      if (error) {
        console.error('버킷 생성 실패:', error);
      } else {
        console.log('✅ 버킷 생성 완료\n');
      }
    }

    // 각 글 처리
    for (const record of records) {
      const articleNumber = parseInt(record['글 번호']);
      const title = record['제목'];
      const thumbnailFilename = record['썸네일 파일명'];

      if (!thumbnailFilename || thumbnailFilename.trim() === '') {
        console.log(`⏭️  [${articleNumber}] ${title} - 썸네일 없음`);
        continue;
      }

      console.log(`📸 [${articleNumber}] ${title}`);

      // articles 폴더에서 썸네일 파일 찾기
      const articlesDir = path.join(process.cwd(), 'articles');
      const allFolders = fs.readdirSync(articlesDir).filter(name => {
        const fullPath = path.join(articlesDir, name);
        return fs.statSync(fullPath).isDirectory() && name !== '.DS_Store';
      });

      // 제목과 일치하는 폴더 찾기
      const matchedFolder = allFolders.find(folder =>
        folder === title || folder.trim() === title.trim()
      );

      if (!matchedFolder) {
        console.log(`   ⚠️  폴더를 찾을 수 없음`);
        continue;
      }

      const articleFolder = path.join(articlesDir, matchedFolder);
      const filesInFolder = fs.readdirSync(articleFolder);

      // 썸네일 파일 찾기 (확장자 포함 또는 제외)
      let thumbnailFile = filesInFolder.find(f => f === thumbnailFilename);

      if (!thumbnailFile) {
        // 확장자 없이 찾기
        thumbnailFile = filesInFolder.find(f => {
          const nameWithoutExt = f.replace(/\.[^/.]+$/, '');
          const filenameWithoutExt = thumbnailFilename.replace(/\.[^/.]+$/, '');
          return nameWithoutExt === filenameWithoutExt ||
                 f.startsWith(thumbnailFilename) ||
                 f.includes(thumbnailFilename);
        });
      }

      if (!thumbnailFile) {
        console.log(`   ⚠️  썸네일 파일을 찾을 수 없음: ${thumbnailFilename}`);
        continue;
      }

      const thumbnailPath = path.join(articleFolder, thumbnailFile);
      const fileExt = path.extname(thumbnailFile) || '.jpg';

      // 파일명을 URL-safe하게 만들기 (한글, 특수문자 제거)
      const sanitizedFilename = thumbnailFilename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // 영문, 숫자, ., _, - 만 허용
        .replace(/_+/g, '_'); // 중복 언더스코어 제거

      const storagePath = `thumbnails/${articleNumber}-${sanitizedFilename}${fileExt}`;

      // 이미지 파일 읽기
      const fileBuffer = fs.readFileSync(thumbnailPath);

      // Supabase Storage에 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(storagePath, fileBuffer, {
          contentType: `image/${fileExt.replace('.', '') || 'jpeg'}`,
          upsert: true,
        });

      if (uploadError) {
        console.log(`   ❌ 업로드 실패: ${uploadError.message}`);
        continue;
      }

      // Public URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(storagePath);

      // articles 테이블 업데이트
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          thumbnail: publicUrl,
          hero_image: publicUrl,
        })
        .eq('article_number', articleNumber);

      if (updateError) {
        console.log(`   ❌ DB 업데이트 실패: ${updateError.message}`);
      } else {
        console.log(`   ✅ 업로드 성공: ${publicUrl}`);
      }
    }

    console.log('\n🎉 모든 썸네일 처리 완료!');

  } catch (error) {
    console.error('❌ 전체 프로세스 실패:', error);
    throw error;
  }
}

// 스크립트 실행
uploadThumbnails()
  .then(() => {
    console.log('✨ 썸네일 업로드 스크립트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 썸네일 업로드 스크립트 실패:', error);
    process.exit(1);
  });
