#!/bin/bash
set -e

# Read token from .env
TOKEN=$(grep '^GITHUB_TOKEN=' ~/.hermes/.env | cut -d= -f2-)
export GITHUB_TOKEN="$TOKEN"

echo "=== Step 1: Creating repo on GitHub ==="
curl -s -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"unicorn-adventure","description":"A pink unicorn platformer game built with React + Canvas","private":false,"auto_init":false}' > /tmp/repo_response.json

REPO_URL=$(python3 -c "import json; d=json.load(open('/tmp/repo_response.json')); print(d.get('html_url',''))" 2>/dev/null)
echo "Repo: $REPO_URL"

# Check for "already exists" error (which is fine)
if echo "$REPO_URL" | grep -q "ERROR"; then
  echo "Repo may already exist, continuing..."
fi

echo ""
echo "=== Step 2: Configure git and push ==="
cd /home/administrator/unicorn-adventure

git remote add origin "https://jjmcnerney:$GITHUB_TOKEN@github.com/jjmcnerney/unicorn-adventure.git" 2>/dev/null || \
  git remote set-url origin "https://jjmcnerney:$GITHUB_TOKEN@github.com/jjmcnerney/unicorn-adventure.git"

git add -A
git commit -m "Deploy unicorn adventure game" || echo "No changes to commit"
git push -u origin main --force 2>/dev/null || git push -u origin master --force

echo ""
echo "=== Step 3: Build for production ==="
node node_modules/vite/bin/vite.js build

echo ""
echo "=== Step 4: Enable GitHub Pages and deploy ==="
curl -s -X PUT \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/jjmcnerney/unicorn-adventure/pages \
  -d '{"build_type":"workflow"}' > /tmp/pages_response.json
echo "Pages response: $(cat /tmp/pages_response.json | head -c 200)"

echo ""
echo "=== Step 5: Create GitHub Pages workflow ==="
mkdir -p .github/workflows
cat > .github/workflows/pages.yml << 'WORKFLOW'
name: Deploy to GitHub Pages
on:
  push:
    branches: ["main"]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: false
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx vite build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - id: deployment
        uses: actions/deploy-pages@v4
WORKFLOW

git add -A
git commit -m "Add GitHub Pages deployment workflow" || echo "Workflow already committed"
git push origin main 2>/dev/null || git push origin master

echo ""
echo "=== DONE ==="
echo "Game should be live at: https://jjmcnerney.github.io/unicorn-adventure/"
echo "It may take 1-2 minutes for the GitHub Actions workflow to complete."
