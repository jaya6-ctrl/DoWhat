#!/bin/sh
set -e
echo "[entrypoint] applying database migrations..."
node ./node_modules/prisma/build/index.js migrate deploy
exec "$@"
