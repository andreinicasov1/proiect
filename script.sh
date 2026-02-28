#!/bin/bash

# ===== НАСТРОЙКИ =====
REPO_URL="https://github.com/andreinicasov1/proiect.git"
START_DATE="2026-03-01 09:00:00"

# массив сообщений
messages=(
  "feat: add"
  "fix: bug fix in"
  "update:"
  "refactor:"
  "chore:"
  "docs:"
)

CURRENT_DATE="$START_DATE"

# функция случайного увеличения времени (1–8 часов)
add_random_time() {
  CURRENT_DATE=$(date -d "$CURRENT_DATE + $((RANDOM % 8 + 1)) hours" "+%Y-%m-%d %H:%M:%S")
}

# ===== ИНИЦИАЛИЗАЦИЯ =====
git init
git branch -M main
git remote add origin "$REPO_URL"

# ===== КОММИТЫ =====
for file in *; do
  if [ -f "$file" ]; then
    
    add_random_time

    msg=${messages[$RANDOM % ${#messages[@]}]}

    git add "$file"
    GIT_AUTHOR_DATE="$CURRENT_DATE" GIT_COMMITTER_DATE="$CURRENT_DATE" \
    git commit -m "$msg $file"
    
  fi
done

# ===== PUSH =====
git push -u origin main
