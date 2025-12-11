import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 5;

async function updateArticleImages() {
  console.log('📝 [5] 우리끼리만의 소통으로 1억 유저 모으기 (2) - 이미지 업로드 중...\n');

  // 폴더 찾기
  const articlesDir = 'articles';
  const allFolders = fs.readdirSync(articlesDir).filter(f =>
    fs.statSync(path.join(articlesDir, f)).isDirectory()
  );
  const folder = allFolders[24]; // 24번 인덱스

  const folderPath = path.join(articlesDir, folder);
  const mdFile = fs.readdirSync(folderPath).find(f => f.endsWith('.md'));

  if (!mdFile) {
    console.error('❌ 마크다운 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  // 이미지 업로드
  const images = [
    {
      filename: 'image.png',
      caption: 'UFO타운 서비스 화면',
      storagePath: 'article-images/5-ufotown-1.png'
    },
    {
      filename: 'image 1.png',
      caption: 'UFO타운 메시지 전송 화면',
      storagePath: 'article-images/5-ufotown-2.png'
    },
    {
      filename: 'image 2.png',
      caption: '버블 소개 영상 갈무리',
      storagePath: 'article-images/5-bubble.png'
    },
    {
      filename: 'image 3.png',
      caption: '위버스 앱 (구글 플레이스토어 제공)',
      storagePath: 'article-images/5-weverse-playstore.png'
    },
    {
      filename: 'image 4.png',
      caption: '위버스 기능 안내 (위버스 제공)',
      storagePath: 'article-images/5-weverse-features.png'
    }
  ];

  const imageUrls: Record<string, string> = {};

  for (const img of images) {
    const imagePath = path.join(folderPath, img.filename);

    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  ${img.filename} 파일을 찾을 수 없습니다.`);
      continue;
    }

    console.log(`📤 ${img.filename} 업로드 중...`);

    const fileBuffer = fs.readFileSync(imagePath);
    const fileExt = path.extname(img.filename);

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(img.storagePath, fileBuffer, {
        contentType: `image/${fileExt.slice(1)}`,
        upsert: true,
      });

    if (uploadError) {
      console.log(`   ❌ 업로드 실패: ${uploadError.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('article-images')
      .getPublicUrl(img.storagePath);

    imageUrls[img.filename] = urlData.publicUrl;
    console.log(`   ✅ 업로드 성공: ${urlData.publicUrl}`);
  }

  // 마크다운 읽기
  const mdPath = path.join(folderPath, mdFile);
  let content = fs.readFileSync(mdPath, 'utf-8');

  // 이미지 경로 교체 - 중복 캡션 제거
  const replacements = [
    {
      old: `![image.png](%E2%80%98%EC%9A%B0%EB%A6%AC%EB%81%BC%EB%A6%AC%EB%A7%8C%EC%9D%98%20%EC%86%8C%ED%86%B5%E2%80%99%EC%9C%BC%EB%A1%9C%201%EC%96%B5%20%EC%9C%A0%EC%A0%80%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%20(2)/image.png)`,
      new: `![UFO타운 서비스 화면](${imageUrls['image.png']})`
    },
    {
      old: `![image.png](%E2%80%98%EC%9A%B0%EB%A6%AC%EB%81%BC%EB%A6%AC%EB%A7%8C%EC%9D%98%20%EC%86%8C%ED%86%B5%E2%80%99%EC%9C%BC%EB%A1%9C%201%EC%96%B5%20%EC%9C%A0%EC%A0%80%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%20(2)/image%201.png)`,
      new: `![UFO타운 메시지 전송 화면](${imageUrls['image 1.png']})`
    },
    {
      old: `![버블 소개 영상 갈무리](%E2%80%98%EC%9A%B0%EB%A6%AC%EB%81%BC%EB%A6%AC%EB%A7%8C%EC%9D%98%20%EC%86%8C%ED%86%B5%E2%80%99%EC%9C%BC%EB%A1%9C%201%EC%96%B5%20%EC%9C%A0%EC%A0%80%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%20(2)/image%202.png)\n\n버블 소개 영상 갈무리`,
      new: `![버블 소개 영상 갈무리](${imageUrls['image 2.png']})`
    },
    {
      old: `![구글 플레이스토어 제공](%E2%80%98%EC%9A%B0%EB%A6%AC%EB%81%BC%EB%A6%AC%EB%A7%8C%EC%9D%98%20%EC%86%8C%ED%86%B5%E2%80%99%EC%9C%BC%EB%A1%9C%201%EC%96%B5%20%EC%9C%A0%EC%A0%80%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%20(2)/image%203.png)\n\n구글 플레이스토어 제공`,
      new: `![위버스 앱 (구글 플레이스토어 제공)](${imageUrls['image 3.png']})`
    },
    {
      old: `![위버스 제공](%E2%80%98%EC%9A%B0%EB%A6%AC%EB%81%BC%EB%A6%AC%EB%A7%8C%EC%9D%98%20%EC%86%8C%ED%86%B5%E2%80%99%EC%9C%BC%EB%A1%9C%201%EC%96%B5%20%EC%9C%A0%EC%A0%80%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%20(2)/image%204.png)\n\n위버스 제공`,
      new: `![위버스 기능 안내 (위버스 제공)](${imageUrls['image 4.png']})`
    }
  ];

  for (const replacement of replacements) {
    content = content.replace(replacement.old, replacement.new);
  }

  console.log('\n📝 Supabase에 콘텐츠 업데이트 중...');

  // Supabase 업데이트
  const { error: updateError } = await supabase
    .from('articles')
    .update({ content })
    .eq('article_number', ARTICLE_NUMBER);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 콘텐츠 업데이트 완료!');
  console.log('\n🎉 모든 작업 완료!');
}

updateArticleImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
