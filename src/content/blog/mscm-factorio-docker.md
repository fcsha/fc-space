---
title: 用 MCSManager 配合自定义 Docker 镜像开 Factorio 服务器
description: 介绍如何构建一个预装 Mod 与存档的 Factorio 自定义 Docker 镜像，并通过 MCSManager 面板以 Docker 方式拉起服务器，实现一键开服与持久化管理。
pubDate: 2026-07-03
tags: [Docker, MCSManager, Factorio]
---

## 为什么选择 Docker + MCSManager

直接在宿主机上跑 Factorio 服务端，长期下来会面临几个麻烦：运行时版本难管理、存档与 Mod 散落各处、多实例相互污染、迁移成本高。把服务端塞进 Docker 镜像后，**环境即代码**，一次构建到处运行；再配合 [MCSManager](https://github.com/MCSManager/MCSManager) 的 Docker 节点能力，就能在 Web 面板上集中启停、查看日志、下发命令，体验和原生进程几乎没有差别。

本文记录一套我实际在用的方案：**构建一个预置存档与 Mod 的自定义镜像，再在 MCSManager 中以 Docker 实例的方式拉起它**。

## 前置准备

- 一台安装好 Docker 的 Linux 服务器
- MCSManager 已部署，且目标节点已完成 Docker 环境对接（在节点设置里填好 `docker.sock` 路径，通常是 `/var/run/docker.sock`）
- 你的 Factorio 账号（用于获取服务端 token 与正版校验）

## 一、构建自定义 Factorio 镜像

社区有成熟的官方镜像 [`factoriotools/factorio`](https://hub.docker.com/r/factoriotools/factorio)，但开箱即用的版本往往不够用——你通常希望镜像里直接带上你的存档、白名单、服务器配置，甚至常用 Mod，避免每次新开实例都要手动传文件。

下面是一个我常用的 `Dockerfile`，基于官方镜像做定制：

```dockerfile
FROM factoriotools/factorio:stable

# 把提前准备好的服务器配置、存档、Mod 一起打进镜像
COPY ./config/server-settings.json /factorio/config/server-settings.json
COPY ./config/map-gen-settings.json /factorio/config/map-gen-settings.json
COPY ./saves/my-world.zip    /factorio/saves/my-world.zip
COPY ./mods/                 /factorio/mods/

# 关闭 RCON 密码随机化，方便面板统一管理；
# 如需对外暴露，按需开放端口
ENV RCON_PASSWORD="your-strong-password-here"
```

说明几点：

- **存档**：把 `.zip` 存档直接打进镜像适合「固定地图」场景。如果你希望存档可变且持久化，不要把存档 COPY 进镜像，而是用卷挂载（见第三节）。
- **Mod**：放进 `/factorio/mods/` 即可，注意版本要与服务端匹配。
- **server-settings.json**：通过它配置服务器名、描述、最大玩家数、是否公开到 Factorio 官方服务器列表、`game_password`、白名单等。记得填上你的 `token` 才能挂在公网列表。

构建并推送到你的镜像仓库（也可以只放在本地）：

```bash
docker build -t my-factorio:1.1.110 .
# 本地用就够了；多机部署再 push
docker tag my-factorio:1.1.110 <registry>/my-factorio:1.1.110
docker push <registry>/my-factorio:1.1.110
```

## 二、在 MCSManager 中创建 Docker 实例

进入 MCSManager 面板，在目标节点下「新建实例」，类型选择 **Docker 容器**：

1. **镜像地址**：填 `my-factorio:1.1.110`（或你推送后的仓库地址）。
2. **启动命令**：官方镜像默认入口已经会自动加载存档启动服务端，通常留空即可；若想指定加载某个存档，可设置：
   ```
   --start-server --load-latest
   ```
3. **端口映射**：Factorio 默认游戏端口 `34197/udp`，RCON 端口 `27015/tcp`。在「端口映射」里把它们暴露出来：
   - `34197` 协议选 **UDP**
   - `27015` 协议选 **TCP**（如果你打算让 MCSManager 通过 RCON 下发指令）
4. **工作目录 / 文件管理**：把容器的 `/factorio/saves` 与 `/factorio/mods` 挂载到宿主机目录，这样即便重建容器，存档与 Mod 也不会丢。MCSManager 的实例「文件管理」会自动把挂载目录当作实例根目录展示，体验和普通实例一致。

## 三、用卷持久化存档（推荐做法）

把存档打进镜像虽然省事，但**每次地图更新都要重新构建镜像**，违背了「镜像只读、数据外置」的最佳实践。更稳妥的方式是用 Docker 卷：

```bash
docker volume create factorio-saves
docker volume create factorio-mods
docker volume create factorio-config
```

在 MCSManager 的实例配置里，把这些卷挂载到对应路径：

| 宿主机卷          | 容器路径           |
| ----------------- | ------------------ |
| `factorio-saves`  | `/factorio/saves`  |
| `factorio-mods`   | `/factorio/mods`   |
| `factorio-config` | `/factorio/config` |

之后所有地图存档、Mod 增删都在 MCSManager 的「文件管理」里完成，**镜像本身保持纯净**，只负责提供正确版本的运行时。

## 四、启动与日常运维

实例创建完成后，在面板点击「启动」，然后在日志窗口观察启动过程。第一次启动正常会出现类似：

```
   1.629 Loading mod core...
   1.629 Loading player-data...
   ...
   2.014 Map saved to /factorio/saves/_autosave1.zip
   2.014 Loading map /factorio/saves/my-world.zip
   ...
   5.112 Hosting game on port: 34197
   5.113 Game is finished starting server
```

看到 `Game is finished starting server` 就说明已经成功对外开服了。客户端通过 `你的IP:34197` 即可连接。

日常运维主要靠 MCSManager 面板：

- **日志 / 控制台**：实时查看，并可直接在输入框下发 `/c` 控制台指令或服务器命令。
- **定时任务**：配合 MCSManager 的计划任务，做定时重启、定时备份存档。
- **多实例**：复制实例配置，改一下端口映射和存档卷，就能在一台机器上开多个互不干扰的 Factorio 服务器。

## 五、几个踩过的坑

- **端口协议别选错**：Factorio 走 **UDP**，如果 MCSManager 默认按 TCP 映射了 34197，玩家是连不上的，日志一切正常但就是没人能进。
- **公网联机要 token**：`server-settings.json` 里没填 `token` 时，服务器能开，但不会出现在官方公开列表，只能靠 IP 直连。
- **RCON 与 MCSManager**：MCSManager 下发指令默认是通过容器 stdin，不依赖 RCON；但如果你想从外部脚本控制服务器，启用 RCON 会更灵活，记得把密码环境变量固定下来。
- **Mod 版本对齐**：客户端和服务端的 Mod 必须版本一致，否则玩家会被踢。把 Mod 列表维护进镜像或挂载卷，方便团队同步。

## 小结

整套方案的思路其实很简单：**让 Docker 镜像负责「环境」，让 MCSManager 负责「编排与可视化」**，让存档与 Mod 通过卷外置以保持可变。这样一来，无论是迁移服务器、开新档、还是同时维护多个档，都只是一次镜像构建或一次实例复制的事，彻底告别「装环境」的体力活。
