---
title: 用 Caddy 替代 Nginx 做反向代理
description: Caddy 的自动 HTTPS 和极简配置让人上瘾，这篇记录从 Nginx 迁移到 Caddy 的过程。
pubDate: 2026-06-20
tags: [Caddy, 运维]
---

## 从 Nginx 迁移到 Caddy

之前用 Nginx 做反代，每加一个子域名就得手动申请证书、改配置、reload。换了 Caddy 之后，`Caddyfile` 两行搞定，证书自动签发自动续期。

## 最简配置

```text
mc.example.com {
    reverse_proxy localhost:25565
}
```

就这么简单。Caddy 启动后自动走 ACME 协议向 Let's Encrypt 申请证书，过期前自动续期。

## 多服务反代

```text
example.com {
    reverse_proxy /api/* localhost:3000
    reverse_proxy /* localhost:8080
}
```

按路径分流，一个域名挂多个后端。比 Nginx 的 `location` 块直观得多。
