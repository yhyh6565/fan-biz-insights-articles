#!/bin/bash
# 일회성 스크립트 정리 도구
# 사용법: bash scripts/cleanup_old_scripts.sh

echo "📦 일회성 스크립트 정리 중..."

# 보관할 디렉토리 생성
mkdir -p scripts/archive

# 일회성 스크립트 목록
OLD_SCRIPTS=(
    "fix_article*.py"
    "upload_article*Images.ts"
    "check_article*.py"
    "analyze_article*.py"
    "debug_article*.py"
    "verify_article*.py"
    "remove_*.py"
    "restore_*.py"
    "update_article*.py"
    "extract*.ts"
    "find*.ts"
    "fix*.ts"
    "check*.ts"
    "indent*.ts"
    "remove*.ts"
    "add*.ts"
    "*.txt"
)

# 아카이브로 이동
count=0
for pattern in "${OLD_SCRIPTS[@]}"; do
    for file in scripts/$pattern; do
        if [ -f "$file" ]; then
            mv "$file" scripts/archive/
            count=$((count + 1))
        fi
    done
done

echo "✅ $count 개 파일을 scripts/archive/ 로 이동했습니다."
echo ""
echo "보관된 스크립트:"
echo "  - scripts/utils/          (범용 스크립트)"
echo "  - scripts/configs/        (설정 파일)"
echo "  - scripts/uploadArticles.ts"
echo "  - scripts/uploadThumbnails.ts"
echo "  - scripts/README.md"
echo ""
echo "나중에 필요없으면 scripts/archive/ 전체를 삭제하세요:"
echo "  rm -rf scripts/archive"
