import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://limvajcxxkgleztxrqpx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function uploadThumbnail() {
  const articlesDir = 'articles';
  const allFolders = fs.readdirSync(articlesDir).filter(f =>
    fs.statSync(path.join(articlesDir, f)).isDirectory()
  );
  const folder = allFolders[13];
  const imagePath = path.join(articlesDir, folder, 'image.png');

  console.log('📝 [8] 실물 앨범 썸네일 업로드 중...');

  const fileBuffer = fs.readFileSync(imagePath);
  const storagePath = 'thumbnails/8-image.png';

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('article-images')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
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
    .eq('article_number', 8);

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
