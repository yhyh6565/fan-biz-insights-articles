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

if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === "여기에_Supabase_대시보드에서_가져온_Service_Role_Key를_입력하세요") {
  console.error('❌ SUPABASE_SERVICE_KEY가 설정되지 않았습니다.');
  console.error('📌 .env 파일에 SUPABASE_SERVICE_KEY를 추가하세요');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface CSVRow {
  '글 번호': string;
  '폴더명': string;
  '제목': string;
  '카테고리': string;
  '키워드': string;
  '업로드 일자': string;
  '요약': string;
  '썸네일 파일명': string;
}

/**
 * 특정 글 번호의 글을 Supabase에 업데이트합니다.
 *
 * @param articleNumber - 업데이트할 글 번호 (예: 4)
 */
async function updateArticle(articleNumber: number) {
  try {
    console.log(`\n📝 글 번호 ${articleNumber} 업데이트 시작...\n`);

    // 1. CSV에서 메타데이터 가져오기
    const csvPath = path.join(process.cwd(), '메타데이터.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    });

    const record = records.find(r => parseInt(r['글 번호']) === articleNumber);

    if (!record) {
      console.error(`❌ CSV에서 글 번호 ${articleNumber}를 찾을 수 없습니다.`);
      process.exit(1);
    }

    const title = record['제목'];
    const category = record['카테고리'];
    const keyword = record['키워드'];
    const publishedAt = record['업로드 일자'];
    const summary = record['요약'];
    const thumbnailFilename = record['썸네일 파일명'];

    console.log(`📚 제목: ${title}`);
    console.log(`📂 카테고리: ${category}`);
    console.log(`🏷️  키워드: ${keyword}\n`);

    // 2. articles 폴더에서 모든 md 파일 찾기
    const articlesDir = path.join(process.cwd(), 'articles');
    const allMdFiles: string[] = [];

    function findMdFiles(dir: string) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findMdFiles(fullPath);
        } else if (file.endsWith('.md')) {
          allMdFiles.push(fullPath);
        }
      }
    }

    findMdFiles(articlesDir);

    // 3. 제목으로 md 파일 찾기
    const normalizeStr = (str: string) => str
      .replace(/\s+/g, '')
      .replace(/[''']/g, '')
      .replace(/["""]/g, '')
      .replace(/[—–-]/g, '')
      .replace(/[,，]/g, '')
      .replace(/[\(\)]/g, '')
      .toLowerCase();

    const matchedFile = allMdFiles.find(filePath => {
      const fileName = path.basename(filePath, '.md');
      return normalizeStr(fileName) === normalizeStr(title);
    });

    if (!matchedFile) {
      console.error(`❌ 제목 "${title}"에 해당하는 md 파일을 찾을 수 없습니다.`);
      console.error(`\n사용 가능한 md 파일들:`);
      allMdFiles.forEach(f => console.error(`  - ${path.basename(f)}`));
      process.exit(1);
    }

    console.log(`✅ 파일 찾음: ${path.basename(matchedFile)}`);

    // 4. md 파일 내용 읽기
    const content = fs.readFileSync(matchedFile, 'utf-8');
    console.log(`📖 파일 크기: ${(content.length / 1024).toFixed(2)} KB\n`);

    // 5. Supabase에서 기존 글 찾기
    const { data: existingArticle, error: findError } = await supabase
      .from('articles')
      .select('id, article_number')
      .eq('article_number', articleNumber)
      .single();

    if (findError) {
      console.error(`❌ Supabase에서 글을 찾는 중 오류 발생: ${findError.message}`);
      process.exit(1);
    }

    if (!existingArticle) {
      console.error(`❌ Supabase에 글 번호 ${articleNumber}가 존재하지 않습니다.`);
      console.error(`💡 새 글을 추가하려면 uploadArticles.ts를 사용하세요.`);
      process.exit(1);
    }

    console.log(`✅ Supabase에서 글 찾음 (ID: ${existingArticle.id})`);

    // 6. Supabase에 업데이트
    const updateData = {
      title: title,
      summary: summary,
      content: content,
      category: category,
      keywords: [keyword],
      thumbnail: thumbnailFilename || null,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('article_number', articleNumber);

    if (updateError) {
      console.error(`❌ 업데이트 실패: ${updateError.message}`);
      process.exit(1);
    }

    console.log(`\n✅ 글 번호 ${articleNumber} 업데이트 성공!`);
    console.log(`🌐 변경사항이 홈페이지에 즉시 반영됩니다.\n`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  }
}

// 명령줄 인자에서 글 번호 가져오기
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ 글 번호를 입력하세요.');
  console.error('사용법: npm run update-article <글번호>');
  console.error('예시: npm run update-article 4');
  process.exit(1);
}

const articleNumber = parseInt(args[0]);
if (isNaN(articleNumber)) {
  console.error('❌ 올바른 글 번호를 입력하세요.');
  process.exit(1);
}

// 스크립트 실행
updateArticle(articleNumber)
  .then(() => {
    console.log('✨ 업데이트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 업데이트 실패:', error);
    process.exit(1);
  });
