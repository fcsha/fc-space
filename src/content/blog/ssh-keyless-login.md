---
title: SSH 免密登录配置
description: 三步搞定 SSH 密钥登录，再也不用输密码。
pubDate: 2026-07-01
updatedDate: 2026-07-05
tags: [SSH, Linux]
---

## 三步搞定

```bash
# 1. 本地生成密钥（已有就跳过）
ssh-keygen -t ed25519

# 2. 把公钥传到服务器
ssh-copy-id user@your-server

# 3. 登录测试
ssh user@your-server
```

## config 简化连接

每次输 `ssh root@123.45.67.89 -p 2222` 太长了。编辑 `~/.ssh/config`：

```
Host myserver
    HostName 123.45.67.89
    User root
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

之后直接 `ssh myserver` 就行。
