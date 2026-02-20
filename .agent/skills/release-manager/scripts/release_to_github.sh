#!/bin/bash
set -e

# 1. Project Root
PROJECT_ROOT="$(pwd)"

echo "========================================"
echo "Phase 0: Readiness Check (Automated)"
echo "========================================"



echo "Running Backend Tests..."
cd backend
if ! npm run test; then
    echo "❌ Backend tests failed! Aborting release."
    exit 1
fi
cd "$PROJECT_ROOT"

echo "Running Frontend Tests..."
cd frontend
if ! npm run test:ci; then
    echo "❌ Frontend tests failed! Aborting release."
    exit 1
fi
cd "$PROJECT_ROOT"

# 2. Extract Version from package.json
VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)

if [ -z "$VERSION" ]; then
  echo "Error: Could not extract version from package.json"
  exit 1
fi

echo "========================================"
echo "releasing to GitHub: v$VERSION"
echo "========================================"

# 3. Extract Changelog (Simplified for now - grabs Top Section)
CHANGELOG_TEXT="Release v$VERSION"

echo "Step 1: Staging changes..."
git add .

echo "Step 2: Committing..."
if git diff-index --quiet HEAD --; then
    echo "No changes to commit."
else
    git commit -m "Release version $VERSION"
fi

echo "Step 3: Tagging..."
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "Tag v$VERSION already exists. Skipping."
else
    git tag -a "v$VERSION" -m "$CHANGELOG_TEXT"
    echo "Created tag v$VERSION"
fi

echo "Step 4: Pushing to GitHub..."
git push origin master
git push origin "v$VERSION"

echo "========================================"
echo "GitHub Release Complete!"
echo "========================================"
