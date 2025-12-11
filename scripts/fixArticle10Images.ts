import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const ARTICLE_NUMBER = 10;

async function fixImages() {
  console.log('📝 [10] 이미지 업로드 및 렌더링 수정 중...\n');

  // 이미지 파일 경로 - 동적으로 찾기
  const articlesDir = '/Users/yeonheedo/Desktop/개인 프로젝트/fan-biz-insights/articles';
  const folders = fs.readdirSync(articlesDir);

  console.log('폴더 목록:');
  folders.forEach(f => console.log(`  - ${f}`));

  const targetFolder = folders.find(f => f.startsWith('앨범은 덤'));

  if (!targetFolder) {
    console.error('❌ 앨범은 덤 폴더를 찾을 수 없습니다');
    process.exit(1);
  }

  const articleFolder = path.join(articlesDir, targetFolder);
  console.log(`\n📁 선택된 폴더: ${articleFolder}\n`);

  const imagesToUpload = [
    { file: '스크린샷_2025-03-29_오후_1.10.03.png', storageName: '10-fx-albums.png', caption: 'f(x) 앨범 콘셉트' },
    { file: '에프엑스_핑크테이프.jpg', storageName: '10-fx-pink-tape.jpg', caption: 'f(x) Pink Tape 앨범' },
    { file: '에프엑스.jpeg', storageName: '10-fx-art-film-1.jpg', caption: 'f(x) Pink Tape 아트 필름' },
    { file: '에프엑스2.jpeg', storageName: '10-fx-art-film-2.jpg', caption: 'f(x) Pink Tape 아트 필름' },
    { file: '다운로드.jpeg', storageName: '10-fx-art-film-3.jpg', caption: 'f(x) Pink Tape 아트 필름' },
    { file: 'f(x)-4_Walls.jpg', storageName: '10-fx-4walls.jpg', caption: 'f(x) 4 Walls 앨범' },
    { file: 'd9gym8q-18b2d293-c1c8-467a-a9de-28b35be6c435.jpg', storageName: '10-fx-4walls-concept.jpg', caption: 'f(x) 4 Walls 콘셉트' },
    { file: 'd8wvxie-9982dcc7-a2ce-4037-9b8a-0b402ab58fe5.jpg', storageName: '10-exo-mama-logo.jpg', caption: 'EXO MAMA 로고' },
    { file: 'SFSy47Rc5tQiS-aKtzmjxw0KelP4N-vroZW5tyxrhN9oZ8ZY10oqwFzt1oRgsWeU76YSOfZu3dbCI6OnXQsuURuToVlGsnKSPkI5UNZxe4VLEKiqgLfZ6Q6sbM6vaF4xUT8rjS8hGI1JYHhqu9W3QQ.png', storageName: '10-exo-overdose-logo.png', caption: 'EXO Overdose 미로 로고' },
    { file: '스크린샷_2025-03-29_오후_1.17.27.png', storageName: '10-exo-monster-logo.png', caption: 'EXO Monster 로고' },
    { file: '스크린샷_2025-03-29_오후_1.17.21.png', storageName: '10-exo-lucky-one-logo.png', caption: 'EXO Lucky One 로고' },
    { file: '엔시티_스타벅스.jpg', storageName: '10-nct-starbucks.jpg', caption: 'NCT 스타벅스 협업 굿즈' }
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
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

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
  const lines = content.split('\n');
  const newLines: string[] = [];

  // 4개 공백 제거 및 캡션 수정
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const leadingSpaces = line.length - line.trimStart().length;

    // 4개 이상 공백이 있고 이미지인 경우
    if (leadingSpaces >= 4 && line.trim().startsWith('![')) {
      newLines.push(line.trim());
    } else {
      newLines.push(line);
    }
  }

  content = newLines.join('\n');

  // 이미지 URL을 Supabase URL로 변경하고 캡션 추가
  const imageMapping = [
    {
      pattern: /!\[스크린샷 2025-03-29 오후 1\.10\.03\.png\]\([^)]+\)/g,
      replacement: `![f(x) 앨범 콘셉트](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-albums.png)`
    },
    {
      pattern: /!\[에프엑스 핑크테이프\.jpg\]\([^)]+\)/g,
      replacement: `![f(x) Pink Tape 앨범](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-pink-tape.jpg)`
    },
    {
      pattern: /!\[에프엑스\.jpeg\]\([^)]+\)/g,
      replacement: `![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-1.jpg)`
    },
    {
      pattern: /!\[에프엑스2\.jpeg\]\([^)]+\)/g,
      replacement: `![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-2.jpg)`
    },
    {
      pattern: /!\[다운로드\.jpeg\]\([^)]+\)/g,
      replacement: `![f(x) Pink Tape 아트 필름](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-art-film-3.jpg)`
    },
    {
      pattern: /!\[f\(x\)-4_Walls\.jpg\]\([^)]+\)/g,
      replacement: `![f(x) 4 Walls 앨범](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-4walls.jpg)`
    },
    {
      pattern: /!\[d9gym8q-18b2d293-c1c8-467a-a9de-28b35be6c435\.jpg\]\([^)]+\)/g,
      replacement: `![f(x) 4 Walls 콘셉트](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-fx-4walls-concept.jpg)`
    },
    {
      pattern: /!\[d8wvxie-9982dcc7-a2ce-4037-9b8a-0b402ab58fe5\.jpg\]\([^)]+\)/g,
      replacement: `![EXO MAMA 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-mama-logo.jpg)`
    },
    {
      pattern: /!\[SFSy47Rc5tQiS-aKtzmjxw0KelP4N-vroZW5tyxrhN9oZ8ZY10oqwFzt1oRgsWeU76YSOfZu3dbCI6OnXQsuURuToVlGsnKSPkI5UNZxe4VLEKiqgLfZ6Q6sbM6vaF4xUT8rjS8hGI1JYHhqu9W3QQ\.png\]\([^)]+\)/g,
      replacement: `![EXO Overdose 미로 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-overdose-logo.png)`
    },
    {
      pattern: /!\[스크린샷 2025-03-29 오후 1\.17\.27\.png\]\([^)]+\)/g,
      replacement: `![EXO Monster 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-monster-logo.png)`
    },
    {
      pattern: /!\[스크린샷 2025-03-29 오후 1\.17\.21\.png\]\([^)]+\)/g,
      replacement: `![EXO Lucky One 로고](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-exo-lucky-one-logo.png)`
    },
    {
      pattern: /!\[엔시티 스타벅스\.jpg\]\([^)]+\)/g,
      replacement: `![NCT 스타벅스 협업 굿즈](https://limvajcxxkgleztxrqpx.supabase.co/storage/v1/object/public/article-images/body-images/10-nct-starbucks.jpg)`
    }
  ];

  for (const mapping of imageMapping) {
    content = content.replace(mapping.pattern, mapping.replacement);
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

  console.log('✅ 이미지 업로드 및 렌더링 수정 완료!');
}

fixImages()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
