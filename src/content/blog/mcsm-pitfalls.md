---
title: MCSManager 踩坑笔记
description: 使用 MCSManager 管理多个游戏服务器时遇到的一些常见问题及解决方案。
pubDate: 2026-06-28
updatedDate: 2026-07-03
tags: [MCSManager, 运维]
---

## Docker 节点连不上

MCSManager 的守护进程默认监听 `23333` 端口。如果面板和守护进程不在同一台机器上，记得检查：

1. 防火墙放行 `23333`（守护进程）和 `24444`（WebSocket）
2. 守护进程配置文件里的 `ip` 不能是 `127.0.0.1`，要改成 `0.0.0.0` 或实际 IP

## Docker 实例找不到镜像

在面板里创建 Docker 实例时，如果镜像名写错了（比如多了 tag 前缀），守护进程会一直卡在拉取阶段。去服务器上 `docker images` 确认镜像名，面板里填的名字必须和 `REPOSITORY:TAG` 完全一致。

## 日志乱码

Windows 节点的控制台输出偶尔会出现乱码，是编码不一致导致的。把守护进程的启动脚本里加上 `chcp 65001` 切到 UTF-8 就好了。
