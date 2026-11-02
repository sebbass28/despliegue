#!/usr/bin/env bash
# Uso: ./deploy.sh nombre-bucket [id-distribucion-cloudfront]
set -euo pipefail
BUCKET=${1:?uso: ./deploy.sh nombre-bucket [distribution-id]}
aws s3 sync . "s3://$BUCKET" --delete --exclude "deploy.sh" --exclude "README.md" --exclude ".*" --cache-control "max-age=300"
aws s3 cp index.html "s3://$BUCKET/index.html" --cache-control "no-cache"
if [ -n "${2:-}" ]; then aws cloudfront create-invalidation --distribution-id "$2" --paths "/*"; fi
