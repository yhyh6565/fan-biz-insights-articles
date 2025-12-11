import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

async function fixMetadata() {
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

    // 실제 articles 폴더의 모든 폴더명 가져오기
    const articlesDir = path.join(process.cwd(), 'articles');
    const actualFolders = fs.readdirSync(articlesDir)
      .filter(name => {
        const fullPath = path.join(articlesDir, name);
        return fs.statSync(fullPath).isDirectory() && name !== '.DS_Store';
      });

    console.log(`📁 실제 폴더 ${actualFolders.length}개 발견\n`);

    // 각 레코드의 폴더명을 실제 폴더명과 매칭
    const updatedRecords = records.map((record: any) => {
      const title = record['제목'];

      // 제목과 일치하는 폴더 찾기 (공백, 특수문자 처리)
      let matchedFolder = actualFolders.find(folder => {
        // 정확히 일치
        if (folder === title) return true;

        // 양쪽 공백 제거 후 비교
        if (folder.trim() === title.trim()) return true;

        // 특수 문자 정규화 후 비교
        const normalizeStr = (str: string) => str
          .replace(/\s+/g, ' ')   // 여러 공백을 하나로
          .replace(/['']/g, "'")  // 따옴표 정규화 (모든 유형)
          .replace(/[""]/g, '"')  // 큰따옴표 정규화
          .replace(/[—–-]/g, '-') // 모든 dash를 hyphen으로
          .replace(/,/g, '')      // 쉼표 제거 (숫자 구분자)
          .trim();

        return normalizeStr(folder) === normalizeStr(title);
      });

      if (matchedFolder) {
        console.log(`✅ 매칭: "${title}" → "${matchedFolder}"`);
        return {
          ...record,
          '폴더명': matchedFolder,
        };
      } else {
        console.log(`⚠️  매칭 실패: "${title}"`);
        return record;
      }
    });

    // 업데이트된 CSV 저장
    const newCsvContent = stringify(updatedRecords, {
      header: true,
      bom: true,
    });

    const backupPath = path.join(process.cwd(), '메타데이터_백업.csv');
    fs.writeFileSync(backupPath, csvContent);
    console.log(`\n💾 원본 백업: ${backupPath}`);

    fs.writeFileSync(csvPath, newCsvContent);
    console.log(`✅ 업데이트된 CSV 저장: ${csvPath}`);

    console.log('\n🎉 메타데이터 수정 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  }
}

// 스크립트 실행
fixMetadata()
  .then(() => {
    console.log('✨ 스크립트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 스크립트 실패:', error);
    process.exit(1);
  });
