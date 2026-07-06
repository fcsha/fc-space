---
title: 用 UFW 简化防火墙管理
description: iptables 太复杂了，UFW 是 Ubuntu 上更友好的前端工具。
pubDate: 2026-07-05
updatedDate: 2026-07-06
tags: [Linux, 安全, UFW]
---

## 基本操作

```bash
ufw allow 22/tcp          # 放行 SSH
ufw allow 80/tcp          # 放行 HTTP
ufw allow 443/tcp         # 放行 HTTPS
ufw allow 25565           # Minecraft
ufw allow 34197/udp       # Factorio
ufw enable
ufw status verbose
```

## 查看规则

```bash
ufw status numbered
```

删规则：

```bash
ufw delete 3
```

序号对应 `status numbered` 里的行号。

## 别忘了 SSH

开 UFW 之前一定先 `ufw allow 22/tcp`，不然一 enable 就把自己锁在外面了。别问我怎么知道的。
