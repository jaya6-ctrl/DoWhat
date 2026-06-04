#!/bin/sh
set -e
# migrate 已在 image build 阶段执行(参见 Dockerfile 的 builder 阶段),
# 这里不再需要运行时 migrate。保留 entrypoint 以便后续插入启动前的 hook。
exec "$@"
