---
title: 用 Docker Compose 一键部署 Minecraft 服务器
description: 记录如何用 Docker Compose 快速搭建一个持久化的 Minecraft 原版服务器，配置数据卷和自动重启。
pubDate: 2026-06-15
updatedDate: 2026-07-04
tags: [Docker, Minecraft]
---

## 为什么用 Docker 跑 Minecraft

直接在宿主机装 Java、下载 jar、写启动脚本，换台机器就得重来。用 Docker 把整个运行环境打包后，一个 `docker compose up` 就能拉起服务，存档和配置全在卷里，迁移只是复制目录。

## compose 配置

核心就是挂载 `data` 目录，把世界存档和配置持久化：

```yaml
services:
  mc:
    image: itzg/minecraft-server
    container_name: mc
    ports:
      - '25565:25565'
    environment:
      EULA: 'TRUE'
      VERSION: '1.21'
      MEMORY: '2G'
    volumes:
      - ./data:/data
    restart: unless-stopped
```

`restart: unless-stopped` 保证服务器崩了能自动拉起来，不用写守护脚本。

## 备份

因为存档都在 `./data` 里，备份就是打包这个目录：

```bash
tar czf backup-$(date +%Y%m%d).tar.gz data/
```

扔到 crontab 里每天跑一次就行。
