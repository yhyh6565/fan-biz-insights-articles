import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 4;

async function updateArticleImages() {
  console.log('📝 [4] 우리끼리만의 소통으로 1억 유저 모으기 (1) - 이미지 업로드 중...\n');

  // 폴더 찾기
  const articlesDir = 'articles';
  const allFolders = fs.readdirSync(articlesDir).filter(f =>
    fs.statSync(path.join(articlesDir, f)).isDirectory()
  );
  const folder = allFolders[23]; // 23번 인덱스

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
      caption: '클럽하우스 앱 화면',
      storagePath: 'article-images/4-clubhouse.png'
    },
    {
      filename: 'image 1.png',
      caption: '메리어트 본보이 멤버십 혜택 안내',
      storagePath: 'article-images/4-marriott-bonvoy.png'
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

  // 이미지 경로 교체 및 캡션 추가
  // 첫 번째 이미지 (클럽하우스)
  const oldImagePath1 = `![image.png](%E2%80%98%EC%9A%B0%EB%A6%AC%EB%81%BC%EB%A6%AC%EB%A7%8C%EC%9D%98%20%EC%86%8C%ED%86%B5%E2%80%99%EC%9C%BC%EB%A1%9C%201%EC%96%B5%20%EC%9C%A0%EC%A0%80%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%20(1)/image.png)`;
  const newImageMarkdown1 = `![클럽하우스 앱 화면](${imageUrls['image.png']})

*클럽하우스 앱 화면*`;

  // 두 번째 이미지 (메리어트)
  const oldImagePath2 = `![image.png](%E2%80%98%EC%9A%B0%EB%A6%AC%EB%81%BC%EB%A6%AC%EB%A7%8C%EC%9D%98%20%EC%86%8C%ED%86%B5%E2%80%99%EC%9C%BC%EB%A1%9C%201%EC%96%B5%20%EC%9C%A0%EC%A0%80%20%EB%AA%A8%EC%9C%BC%EA%B8%B0%20(1)/image%201.png)`;
  const newImageMarkdown2 = `![메리어트 본보이 멤버십 혜택 안내](${imageUrls['image 1.png']})

*메리어트 본보이 멤버십 혜택 안내*`;

  content = content.replace(oldImagePath1, newImageMarkdown1);
  content = content.replace(oldImagePath2, newImageMarkdown2);

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
