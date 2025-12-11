# 글 수정 워크플로우

## 개요
이 디렉토리는 Supabase에 업로드된 글의 이미지와 텍스트 렌더링을 수정하는 범용 스크립트를 포함합니다.

## 주요 스크립트

### 1. 이미지 업로드
```bash
python3 scripts/utils/upload_article_images.py <article_number> <config_file>
```

**기능:**
- 로컬 이미지를 Supabase Storage에 업로드
- 자동 리사이즈 (최대 800px 너비)
- 포맷 최적화 (JPEG 85% 품질, PNG optimize)
- DB의 content에서 경로 교체

**예시:**
```bash
python3 scripts/utils/upload_article_images.py 19 scripts/configs/article19.json
```

### 2. 이미지 렌더링 수정
```bash
python3 scripts/utils/fix_image_rendering.py <article_number>
```

**기능:**
- URL 인코딩된 경로를 디코딩
- alt 텍스트 안의 링크를 캡션으로 분리
- 출처를 이미지 아래로 이동 (이탤릭체)

**예시:**
```bash
python3 scripts/utils/fix_image_rendering.py 19
```

### 3. 텍스트 렌더링 수정
```bash
python3 scripts/utils/fix_text_rendering.py <article_number>
```

**기능:**
- 불필요한 들여쓰기 제거
- 중복 캡션 삭제
- 마크다운 문법 오류 수정

**예시:**
```bash
python3 scripts/utils/fix_text_rendering.py 19
```

## 설정 파일 형식

`scripts/configs/article<N>.json`:

```json
{
  "article_folder": "/path/to/articles/글제목",
  "images": [
    {
      "file": "local-filename.jpg",
      "storage": "19-descriptive-name.jpg",
      "old_patterns": [
        "./local-filename.jpg",
        "%EC%9D%B8%EC%BD%94%EB%94%A9%EB%90%9C%EA%B2%BD%EB%A1%9C.jpg"
      ]
    }
  ]
}
```

## 전체 워크플로우 예시

```bash
# 1. 이미지 업로드
python3 scripts/utils/upload_article_images.py 19 scripts/configs/article19.json

# 2. 이미지 렌더링 수정
python3 scripts/utils/fix_image_rendering.py 19

# 3. 텍스트 렌더링 수정
python3 scripts/utils/fix_text_rendering.py 19
```

## 기존 스크립트 정리

작업 완료 후 `scripts/` 폴더의 일회성 스크립트는 삭제 가능:
- `fix_article*.py` (1-19번)
- `upload_article*Images.ts`
- `check_article*.py`
- 기타 디버그 스크립트

**보관할 파일:**
- `scripts/utils/` - 범용 스크립트
- `scripts/configs/` - 설정 파일 (재현 가능성을 위해)
- `scripts/uploadArticles.ts` - 초기 업로드용
- `scripts/uploadThumbnails.ts` - 썸네일 업로드용

## 의존성

```bash
pip3 install supabase python-dotenv pillow --user
```

## 환경 변수

`.env` 파일:
```
SUPABASE_SERVICE_KEY=your_service_role_key_here
```
