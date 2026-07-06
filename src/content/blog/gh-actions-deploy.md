---
title: 用 GitHub Actions 自动部署静态站点
description: 一个极简的 GitHub Actions workflow，push 后自动构建 Astro 站点并部署到服务器。
pubDate: 2026-06-30
tags: [CI/CD, GitHub Actions, Astro]
---

## workflow 文件

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Deploy
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_KEY }}
          REMOTE_HOST: ${{ secrets.HOST }}
          SOURCE: dist/
          TARGET: /var/www/fcsha/
```

## 注意事项

- `pnpm` 的版本要和本地一致，不然 lockfile 会报错
- SSH 私钥存在 repo 的 Secrets 里，别提交到代码
- `TARGET` 目录确保 deploy 用户有写权限

push 到 main 分支后，整个流程大约 40 秒完成构建和部署。
