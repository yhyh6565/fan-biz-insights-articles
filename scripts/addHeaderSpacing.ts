import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addHeaderSpacing() {
  console.log('📝 모든 글의 헤더 앞뒤로 두 줄 띄우기 중...\n');

  // 모든 articles 가져오기
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, article_number, title, content')
    .order('article_number');

  if (fetchError || !articles) {
    console.error('❌ 글을 가져올 수 없습니다:', fetchError?.message);
    process.exit(1);
  }

  console.log(`총 ${articles.length}개의 글 처리 시작...\n`);

  let processedCount = 0;

  for (const article of articles) {
    let content = article.content;
    const lines = content.split('\n');
    const newLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 헤더인지 확인 (#, ##, ### 으로 시작)
      const isHeader = /^#{1,3}\s/.test(trimmed);

      if (isHeader) {
        // 헤더 앞에 빈 줄 2개 추가 (첫 줄이 아니고, 이미 빈 줄이 충분하지 않은 경우)
        if (newLines.length > 0) {
          // 마지막에 추가된 빈 줄 개수 확인
          let emptyLinesBefore = 0;
          for (let j = newLines.length - 1; j >= 0 && newLines[j].trim() === ''; j--) {
            emptyLinesBefore++;
          }

          // 빈 줄이 2개 미만이면 추가
          if (emptyLinesBefore < 2) {
            for (let k = 0; k < 2 - emptyLinesBefore; k++) {
              newLines.push('');
            }
          }
        }

        newLines.push(line);

        // 헤더 뒤에 빈 줄 2개 확보 (다음 줄 확인)
        let emptyLinesAfter = 0;
        for (let j = i + 1; j < lines.length && lines[j].trim() === ''; j++) {
          emptyLinesAfter++;
        }

        // 빈 줄이 2개 미만이면 필요한 만큼 추가
        if (emptyLinesAfter < 2) {
          for (let k = 0; k < 2 - emptyLinesAfter; k++) {
            newLines.push('');
          }
          // 기존 빈 줄들은 건너뛰기
          i += emptyLinesAfter;
        } else {
          // 빈 줄이 2개 이상이면 2개만 유지
          for (let k = 0; k < 2; k++) {
            newLines.push('');
          }
          i += emptyLinesAfter;
        }
      } else {
        newLines.push(line);
      }
    }

    const newContent = newLines.join('\n');

    // 내용이 변경되었으면 업데이트
    if (newContent !== content) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ content: newContent })
        .eq('id', article.id);

      if (updateError) {
        console.log(`❌ [${article.article_number}] ${article.title} 업데이트 실패:`, updateError.message);
      } else {
        console.log(`✅ [${article.article_number}] ${article.title}`);
        processedCount++;
      }
    } else {
      console.log(`⏭️  [${article.article_number}] ${article.title} (변경 없음)`);
    }
  }

  console.log(`\n✅ 총 ${processedCount}개 글의 헤더 간격 조정 완료!`);
}

addHeaderSpacing()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
