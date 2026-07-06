---
title: 从零搭建 Factorio headless 服务器
description: 不依赖面板，纯命令行启动一个 Factorio 专用服务器。
pubDate: 2026-07-03
tags: [Factorio, Linux, 游戏服务器]
---

## 下载服务端

```bash
wget https://factorio.com/get-download/latest/headless/linux64
tar xf linux64 -C /opt/factorio
```

## 创建存档

第一次运行需要生成世界：

```bash
/opt/factorio/bin/x64/factorio --create my-save --map-gen-settings /opt/factorio/data/map-gen-settings.example.json
```

## 启动服务器

```bash
/opt/factorio/bin/x64/factorio \
    --start-server my-save \
    --server-settings /opt/factorio/data/server-settings.example.json
```

记得改 `server-settings.json` 里的以下字段：

- `name`：服务器名称
- `description`：描述
- `password`：加入密码
- `max_players`：人数上限

## 开放端口

Factorio 默认用 UDP `34197`，防火墙记得放行：

```bash
ufw allow 34197/udp
```

如果用了云服务器，安全组也要加上。
