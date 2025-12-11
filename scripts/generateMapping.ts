import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const csvContent = fs.readFileSync('메타데이터.csv', 'utf-8');
const records = parse(csvContent, { columns: true, skip_empty_lines: true, bom: true });

const allFolders = fs.readdirSync('articles').filter(f =>
  fs.statSync('articles/' + f).isDirectory()
);

const articlesToMap = [8, 10, 11, 20, 21, 30];

console.log('// CSV 제목 → 실제 폴더명 매핑');
console.log('const TITLE_TO_FOLDER_MAP: Record<string, string> = {');

articlesToMap.forEach(num => {
  const record = records.find(r => parseInt(r['글 번호']) === num);
  if (!record) return;

  const csvTitle = record['제목'];

  // 제목에서 키워드 추출해서 매칭
  let matchedFolder = null;

  if (csvTitle.includes('실물 앨범')) {
    matchedFolder = allFolders.find(f => f.includes('실물 앨범'));
  } else if (csvTitle.includes('앨범은 덤')) {
    matchedFolder = allFolders.find(f => f.includes('앨범은 덤'));
  } else if (csvTitle.includes('4,500') || csvTitle.includes('4500')) {
    matchedFolder = allFolders.find(f => f.includes('4,500') || f.includes('4500') || f.includes('NCT'));
  } else if (csvTitle.includes('콘텐츠 없이')) {
    matchedFolder = allFolders.find(f => f.includes('콘텐츠 없이'));
  } else if (csvTitle.includes('SM깔')) {
    matchedFolder = allFolders.find(f => f.includes('SM깔'));
  } else if (csvTitle.includes('경험의 멸종')) {
    matchedFolder = allFolders.find(f => f.includes('경험의 멸종'));
  }

  if (matchedFolder) {
    console.log(`  ${JSON.stringify(csvTitle)}: ${JSON.stringify(matchedFolder)},`);
  } else {
    console.log(`  // NOT FOUND: ${JSON.stringify(csvTitle)}`);
  }
});

console.log('};');
