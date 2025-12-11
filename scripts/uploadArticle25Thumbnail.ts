import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadThumbnail() {
  const folderName = '너는 무엇을 위해 함께할 수 있는가 — 15년 동안 마블이 만들어온 메시지';
  const imagePath = path.join('articles', folderName, '1_yj8i474Z5I220Bt-sT2EyQ.webp');

  console.log('📝 [25] 너는 무엇을 위해 함께할 수 있는가 썸네일 업로드 중...');

  const fileBuffer = fs.readFileSync(imagePath);
  const storagePath = 'thumbnails/25-1_yj8i474Z5I220Bt-sT2EyQ.webp';

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('article-images')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (uploadError) {
    console.log('❌ 업로드 실패:', uploadError.message);
    process.exit(1);
  }

  const { data: urlData } = supabase.storage
    .from('article-images')
    .getPublicUrl(storagePath);

  const publicUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from('articles')
    .update({ thumbnail: publicUrl })
    .eq('article_number', 25);

  if (updateError) {
    console.log('❌ DB 업데이트 실패:', updateError.message);
    process.exit(1);
  }

  console.log('✅ 썸네일 업로드 성공!');
  console.log('📎 URL:', publicUrl);
}

uploadThumbnail()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ 오류:', err);
    process.exit(1);
  });
