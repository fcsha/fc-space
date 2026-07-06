---
title: Docker 网络基础笔记
description: Docker bridge、host、none 三种网络模式的区别和使用场景。
pubDate: 2026-07-02
tags: [Docker, 网络]
---

## 三种内置网络

| 网络       | 说明                           | 适用场景         |
| ---------- | ------------------------------ | ---------------- |
| **bridge** | 默认模式，容器通过虚拟网桥通信 | 大多数情况       |
| **host**   | 容器直接用宿主机网络栈         | 需要最高网络性能 |
| **none**   | 无网络                         | 离线计算任务     |

## bridge 模式

`docker run` 默认就是 bridge。容器之间通过 Docker 内置 DNS 互相发现，用容器名就能访问：

```bash
docker network create mynet
docker run --network mynet --name db postgres
docker run --network mynet --name app myapp
```

`app` 容器里直接用 `db:5432` 就能连上数据库，不用管 IP。

## 端口映射

bridge 模式下需要 `-p` 映射端口才能被外部访问：

```bash
docker run -p 8080:80 nginx
```

host 模式不需要映射，但也就没有端口隔离了。
