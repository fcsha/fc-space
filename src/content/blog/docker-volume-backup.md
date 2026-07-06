---
title: 定时备份 Docker Volume 到本地目录
description: 一个简单的 shell 脚本，配合 crontab 实现 Docker 数据卷的每日增量备份。
pubDate: 2026-06-25
tags: [Docker, Bash, 备份]
---

## 思路

Docker Volume 的数据在 `/var/lib/docker/volumes` 下面，直接拷不太优雅。用 `docker run` 临时挂载卷，`tar` 打包出来最干净。

## 脚本

```bash
#!/bin/bash
BACKUP_DIR="/backup/docker"
DATE=$(date +%Y%m%d)

for volume in $(docker volume ls -q); do
    docker run --rm \
        -v "${volume}:/source:ro" \
        -v "${BACKUP_DIR}:/backup" \
        alpine tar czf "/backup/${volume}-${DATE}.tar.gz" -C /source .
done

# 保留最近 7 天
find "${BACKUP_DIR}" -name "*.tar.gz" -mtime +7 -delete
```

## 挂 crontab

```bash
0 3 * * * /opt/scripts/backup-volumes.sh
```

每天凌晨三点跑一次。脚本最后一行自动清理 7 天前的旧备份，不用担心磁盘被撑满。
