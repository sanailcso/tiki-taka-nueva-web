#!/usr/bin/env bash
set -euo pipefail

vite build --config vite.pages.config.ts
mkdir -p dist-pages/admin/login dist-pages/admin/preview
cp dist-pages/index.html dist-pages/admin/index.html
cp dist-pages/index.html dist-pages/admin/login/index.html
cp dist-pages/index.html dist-pages/admin/preview/index.html

