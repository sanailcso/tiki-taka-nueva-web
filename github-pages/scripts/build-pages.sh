#!/usr/bin/env bash
set -euo pipefail

vite build --config vite.pages.config.ts
node scripts/prepare-pages.mjs
