#!/bin/bash
set -e  # 遇到错误立即退出

# 日志文件
LOG_FILE="/root/xujun/opt/baseline/log/wikimem-auto-$(date +%Y%m%d).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== 开始自动更新 $(date) ==="

# ---------- 1. 工作目录 ----------
WORK_DIR="/root/xujun/opt/baseline"
cd "$WORK_DIR"

# ---------- 2. 确保 Git 仓库正确 ----------
if [ ! -d ".git" ]; then
    echo "Git 仓库不存在，初始化..."
    git init
    git remote add origin https://gh-proxy.com/github.com/xuyaxiong/wikimem.git
    git fetch origin
else
    # 检查远程地址是否为 gh-proxy.com，如果不是则修正
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ "$REMOTE_URL" != *"gh-proxy.com"* ]]; then
        echo "修正远程仓库地址为 gh-proxy.com 镜像..."
        git remote set-url origin https://gh-proxy.com/github.com/xuyaxiong/wikimem.git
        git fetch origin
    fi
fi

# ---------- 3. 切换到 sx 分支（如果存在），否则 main ----------
BRANCH="sx"
if git show-ref --verify --quiet refs/remotes/origin/$BRANCH; then
    echo "切换到分支 $BRANCH"
    git checkout $BRANCH
    git pull origin $BRANCH
else
    echo "分支 $BRANCH 不存在，尝试切换到 main"
    BRANCH="main"
    git checkout main 2>/dev/null || git checkout -t origin/main
    git pull origin main
fi

# ---------- 4. 清理旧容器和网络 ----------
echo "清理旧容器和网络..."
docker compose down

# ---------- 5. 构建 Docker 镜像 ----------
echo "构建 Docker 镜像..."
DOCKER_BUILDKIT=0 docker compose build --no-cache

# ---------- 6. 启动服务 ----------
echo "启动服务..."
docker compose up -d

echo "=== 更新完成 $(date) ==="
