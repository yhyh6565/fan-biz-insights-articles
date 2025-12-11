import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// Supabase 클라이언트 설정
const SUPABASE_URL = "https://limvajcxxkgleztxrqpx.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 업로드할 article_number 리스트
const ARTICLE_NUMBERS_TO_UPLOAD = [8, 10, 11, 20, 21, 30];

interface CSVRow {
  '글 번호': string;
  '제목': string;
  '썸네일 파일명': string;
}

// 폴더 인덱스로 직접 매핑
const folderIndexMap: Record<number, number> = {
  8: 13,
  10: 14,
  11: 9,
  20: 25,
  21: 22,
  30: 6,
};

async function uploadThumbnails() {
  try {
    console.log('📚 메타데이터 CSV 파일 읽는 중...');

    // CSV 파일 읽기
    const csvPath = path.join(process.cwd(), '메타데이터.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    });

    console.log(`✅ ${ARTICLE_NUMBERS_TO_UPLOAD.length}개의 글 썸네일 업로드 시작\n`);

    // articles 폴더 목록 가져오기
    const articlesDir = path.join(process.cwd(), 'articles');
    const allFolders = fs.readdirSync(articlesDir)
      .filter(name => {
        const fullPath = path.join(articlesDir, name);
        return fs.statSync(fullPath).isDirectory() && name !== '.DS_Store';
      });

    // 각 글 처리
    for (const articleNumber of ARTICLE_NUMBERS_TO_UPLOAD) {
      const record = records.find(r => parseInt(r['글 번호']) === articleNumber);

      if (!record) {
        console.log(`⚠️  [${articleNumber}] CSV에서 찾을 수 없음`);
        continue;
      }

      const title = record['제목'];
      const thumbnailFilename = record['썸네일 파일명'];

      console.log(`📝 처리 중: [${articleNumber}] ${title}`);

      if (!thumbnailFilename) {
        console.log(`   ⚠️  썸네일 파일명이 없습니다.`);
        continue;
      }

      // 폴더 찾기
      const matchedFolder = allFolders[folderIndexMap[articleNumber]];

      if (!matchedFolder) {
        console.log(`   ⚠️  폴더를 찾을 수 없습니다.`);
        continue;
      }

      const articleFolder = path.join(articlesDir, matchedFolder);

      // 폴더 내 이미지 파일 찾기
      const filesInFolder = fs.readdirSync(articleFolder);
      const imageFile = filesInFolder.find(f => {
        const baseName = path.parse(f).name;
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) &&
               baseName === thumbnailFilename;
      });

      if (!imageFile) {
        console.log(`   ⚠️  이미지 파일을 찾을 수 없습니다: ${thumbnailFilename}`);
        continue;
      }

      const imagePath = path.join(articleFolder, imageFile);
      const fileExt = path.extname(imageFile);

      // 파일명을 URL-safe하게 만들기
      const sanitizedFilename = thumbnailFilename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_');

      const storagePath = `thumbnails/${articleNumber}-${sanitizedFilename}${fileExt}`;

      // 파일 읽기
      const fileBuffer = fs.readFileSync(imagePath);

      // Supabase Storage에 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(storagePath, fileBuffer, {
          contentType: `image/${fileExt.slice(1)}`,
          upsert: true, // 이미 존재하면 덮어쓰기
        });

      if (uploadError) {
        console.log(`   ❌ 업로드 실패: ${uploadError.message}`);
        continue;
      }

      // Public URL 가져오기
      const { data: urlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // articles 테이블 업데이트
      const { error: updateError } = await supabase
        .from('articles')
        .update({ thumbnail: publicUrl })
        .eq('article_number', articleNumber);

      if (updateError) {
        console.log(`   ❌ DB 업데이트 실패: ${updateError.message}`);
      } else {
        console.log(`   ✅ 썸네일 업로드 성공!`);
        console.log(`   📎 URL: ${publicUrl}`);
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
