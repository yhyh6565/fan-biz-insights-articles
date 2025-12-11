import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// Supabase 클라이언트 설정
const SUPABASE_URL = "https://limvajcxxkgleztxrqpx.supabase.co";

// Service Role Key를 사용 (RLS 우회)
// 환경변수에서 가져오거나, 직접 입력
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  "여기에_Supabase_대시보드에서_가져온_Service_Role_Key를_입력하세요";

if (SUPABASE_SERVICE_KEY === "여기에_Supabase_대시보드에서_가져온_Service_Role_Key를_입력하세요") {
  console.error('❌ SUPABASE_SERVICE_KEY가 설정되지 않았습니다.');
  console.error('📌 Supabase 대시보드 > Project Settings > API > service_role key를 복사해서:');
  console.error('   1. .env 파일에 SUPABASE_SERVICE_KEY= 추가하거나');
  console.error('   2. scripts/uploadArticles.ts 파일에 직접 입력하세요');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 기본 저자 정보 (필요시 수정)
const DEFAULT_AUTHOR = {
  name: "덕질로 배운 비즈니스",
  avatar: null, // 저자 아바타 URL이 있다면 여기에 입력
};

// CSV 제목 → 실제 폴더명 매핑 (정확히 매칭되지 않는 경우)
const TITLE_TO_FOLDER_MAP: Record<string, string> = {
  // CSV는 curly quotes (' '), 폴더명은 straight quotes (')
  "실물 앨범, 이제 '기능'이 아닌 '감정'을 판다": `실물 앨범, 이제 '기능'이 아닌 '감정'을 판다`,
  "앨범은 덤, SM의 '큰 그림 전략'": `앨범은 덤, SM의 '큰 그림 전략'`,
  "따로 또 같이, 4,500만 장을 판 팀 'NCT'": `따로 또 같이, 4,500만 장을 판 팀 'NCT'`,
  "'콘텐츠 없이' 데뷔 0일 차에 팬덤 보유?": `'콘텐츠 없이' 데뷔 0일 차에 팬덤 보유?`,
  "'SM깔'이라는 100점짜리 품질보증서": `'SM깔'이라는 100점짜리 품질보증서`,
  "경험의 멸종 시대, K-POP은 어떻게 '진짜 경험'을 팔고 있는가?": `경험의 멸종 시대, K-POP은 어떻게 '진짜 경험'을 팔고 있는가?`,
};

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

async function uploadArticles() {
  try {
    console.log('📚 메타데이터 CSV 파일 읽는 중...');

    // CSV 파일 읽기
    const csvPath = path.join(process.cwd(), '메타데이터.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true, // UTF-8 BOM 처리
    });

    console.log(`✅ ${records.length}개의 글 발견\n`);

    // 각 글 처리
    for (const record of records) {
      try {
        const articleNumber = parseInt(record['글 번호']);
        const title = record['제목'];
        const category = record['카테고리'];
        const keyword = record['키워드'];
        const publishedAt = record['업로드 일자'];
        const summary = record['요약'];
        const thumbnailFilename = record['썸네일 파일명'];

        console.log(`📝 처리 중: [${articleNumber}] ${title}`);

        const articlesDir = path.join(process.cwd(), 'articles');

        // 실제 폴더 목록 가져오기
        const allFolders = fs.readdirSync(articlesDir)
          .filter(name => {
            const fullPath = path.join(articlesDir, name);
            return fs.statSync(fullPath).isDirectory() && name !== '.DS_Store';
          });

        // 폴더 인덱스로 직접 매핑 (allFolders는 알파벳 순서)
        const folderIndexMap: Record<number, number> = {
          8: 13,   // 14번째 폴더 (0-based index)
          10: 14,  // 15번째 폴더
          11: 9,   // 10번째 폴더
          20: 25,  // 26번째 폴더
          21: 22,  // 23번째 폴더
          30: 6,   // 7번째 폴더
        };

        let matchedFolder: string | undefined;

        if (folderIndexMap[articleNumber] !== undefined) {
          matchedFolder = allFolders[folderIndexMap[articleNumber]];
          if ([8, 10, 11, 20, 21, 30].includes(articleNumber)) {
            console.log(`   🔍 Folder by index [${folderIndexMap[articleNumber]}]: ${JSON.stringify(matchedFolder)}`);
          }
        }

        // 키워드 매칭이 실패하면 매핑 테이블 확인
        if (!matchedFolder) {
          matchedFolder = TITLE_TO_FOLDER_MAP[title];
        }

        // 매핑도 실패하면 정규화 매칭 시도
        if (!matchedFolder) {
          const normalizeStr = (str: string) => str
            .replace(/\s+/g, '')          // 모든 공백 제거
            .replace(/[''']/g, '')        // 모든 타입의 작은따옴표 제거
            .replace(/["""]/g, '')        // 모든 타입의 큰따옴표 제거
            .replace(/[—–-]/g, '')        // 모든 dash 제거
            .replace(/[,，]/g, '')         // 쉼표 제거
            .replace(/[\(\)]/g, '')       // 괄호 제거
            .toLowerCase();

          matchedFolder = allFolders.find(folder => {
            // 정확히 일치
            if (folder === title || folder.trim() === title.trim()) return true;
            // 정규화 후 비교
            return normalizeStr(folder) === normalizeStr(title);
          });
        }

        if (!matchedFolder) {
          console.log(`   ⚠️  폴더를 찾을 수 없습니다: "${title}"`);
          continue;
        }

        // 폴더 안에서 .md 파일 찾기
        const articleFolder = path.join(articlesDir, matchedFolder);
        const filesInFolder = fs.readdirSync(articleFolder);
        const mdFile = filesInFolder.find(f => f.endsWith('.md'));

        if (!mdFile) {
          console.log(`   ⚠️  마크다운 파일을 찾을 수 없습니다: ${articleFolder}`);
          continue;
        }

        const mdFilePath = path.join(articleFolder, mdFile);

        const content = fs.readFileSync(mdFilePath, 'utf-8');

        // 썸네일 URL 처리 (파일명이 있는 경우에만)
        let thumbnailUrl = null;
        if (thumbnailFilename) {
          // 나중에 Supabase Storage에 업로드 후 URL로 변경 예정
          // 일단은 파일명만 저장
          thumbnailUrl = thumbnailFilename;
        }

        // Supabase에 업로드할 데이터 준비
        const articleData = {
          article_number: articleNumber,
          title: title,
          summary: summary,
          content: content,
          category: category,
          keywords: [keyword], // 배열로 변환
          author_name: DEFAULT_AUTHOR.name,
          author_avatar: DEFAULT_AUTHOR.avatar,
          thumbnail: thumbnailUrl,
          hero_image: null, // 필요시 나중에 추가
          published_at: publishedAt,
          views: 0,
          likes: 0,
          shares: 0,
        };

        // Supabase에 삽입
        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select();

        if (error) {
          console.log(`   ❌ 업로드 실패: ${error.message}`);
        } else {
          console.log(`   ✅ 업로드 성공! ID: ${data[0].id}`);
        }

      } catch (err) {
        console.log(`   ❌ 오류 발생: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    console.log('\n🎉 모든 글 처리 완료!');

  } catch (error) {
    console.error('❌ 전체 프로세스 실패:', error);
    throw error;
  }
}

// 스크립트 실행
uploadArticles()
  .then(() => {
    console.log('✨ 업로드 스크립트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 업로드 스크립트 실패:', error);
    process.exit(1);
  });
