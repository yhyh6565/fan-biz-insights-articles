import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

// 매핑: 글 번호 -> 실제 폴더명
const numberToFolder: Record<number, string> = {
  8: "실물 앨범, 이제 '기능'이 아닌 '감정'을 판다",
  10: "앨범은 덤, SM의 '큰 그림 전략'",
  11: "따로 또 같이, 4,500만 장을 판 팀 'NCT'",
  20: "'콘텐츠 없이' 데뷔 0일 차에 팬덤 보유?",
  21: "'SM깔'이라는 100점짜리 품질보증서",
  30: "경험의 멸종 시대, K-POP은 어떻게 '진짜 경험'을 팔고 있는가?",
};

// CSV 읽기
const csvContent = fs.readFileSync('메타데이터.csv', 'utf-8');
const records: any[] = parse(csvContent, { columns: true, skip_empty_lines: true, bom: true });

// 수정
records.forEach((record) => {
  const num = parseInt(record['글 번호']);
  if (numberToFolder[num]) {
    console.log(`수정: [${num}] ${record['제목']} -> ${numberToFolder[num]}`);
    record['제목'] = numberToFolder[num];
    record['폴더명'] = numberToFolder[num];
  }
});

// 저장
const newCsv = stringify(records, { header: true, bom: true });
fs.writeFileSync('메타데이터.csv', newCsv);

console.log('\n✅ CSV 파일 수정 완료!');
