---
title: 用 systemd 管理游戏服务器进程
description: 不用第三方面板，用 systemd 原生管理游戏服务器的启停和开机自启。
pubDate: 2026-07-04
tags: [Linux, systemd, 运维]
---

## 为什么用 systemd

很多人的游戏服务器还在用 `screen` + 手动启动。systemd 是 Linux 自带的进程管理器，开机自启、崩溃重启、日志收集全都有，不用额外装软件。

## service 文件

在 `/etc/systemd/system/` 下创建 `mc.service`：

```ini
[Unit]
Description=Minecraft Server
After=network.target

[Service]
Type=simple
User=mc
WorkingDirectory=/opt/mc
ExecStart=/usr/bin/java -Xmx2G -jar server.jar nogui
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 常用命令

```bash
systemctl daemon-reload
systemctl start mc
systemctl enable mc     # 开机自启
systemctl status mc
journalctl -u mc -f     # 实时看日志
```

`Restart=on-failure` 加 `RestartSec=10` 意味着进程异常退出后 10 秒自动拉起，比写守护脚本省心多了。
