# Coolify 部署指南：从 Vercel 到容器化部署

## 概述

本项目最初是为 **Vercel Serverless** 部署设计的，但 Coolify 采用的是 **容器化部署**（Docker）模式。这两种部署方式在架构上有本质区别，需要对项目进行适配。本文档将详细解释修改原理和步骤。

---

## 知识要点列表

1. **Vercel Serverless vs 容器化部署的核心差异**
2. **为什么需要 Dockerfile**
3. **多阶段构建的优势**
4. **Express 如何同时服务前端和 API**
5. **SPA（单页应用）路由回退机制**
6. **环境变量的正确配置方式**

---

## 详细知识要点

### 1. Vercel Serverless vs 容器化部署

| 维度 | Vercel Serverless | Coolify (Docker) |
|------|-------------------|------------------|
| **运行方式** | 函数即服务（FaaS），按需启动 | 常驻进程，始终运行 |
| **入口方式** | Vercel Handler 函数 | HTTP 服务器监听端口 |
| **静态资源** | Vercel 自动托管 `dist/` | 需要自己通过 Express 服务 |
| **环境变量** | Vercel 控制台配置 | Coolify 注入或 `.env` 文件 |
| **路由** | `vercel.json` 配置 rewrites | Express 路由中间件 |

**关键点**：Vercel 的 `api/index.ts` 是一个函数 `handler(req, res)`，由 Vercel 平台调用；而 Docker 需要一个传统的 HTTP 服务器进程。

### 2. 为什么需要 Dockerfile

Coolify 通过 Docker 部署应用，Dockerfile 定义了：
- 使用什么基础镜像（`node:20-alpine`）
- 安装哪些依赖
- 如何构建项目
- 启动命令是什么

没有 Dockerfile，Coolify 无法知道如何构建和运行你的应用。

### 3. 多阶段构建的优势

我们使用了 **多阶段构建**（Multi-stage Build）：

```
Stage 1 (builder): 安装所有依赖 → 编译 TypeScript → 构建 Vite
         ↓
Stage 2 (runner):  只安装生产依赖 → 复制构建产物 → 启动应用
```

**好处**：
- 最终镜像体积小（不含 devDependencies）
- 安全性高（不含源代码和构建工具）
- 部署速度快（镜像下载更快）

### 4. Express 同时服务前端和 API

修改前，项目的架构是分离的：
- 前端：Vite dev server 服务静态资源
- 后端：Express 只处理 API 请求

修改后，Express 承担双重职责：
1. **API 路由**：`/api/auth`、`/api/payment` 等
2. **静态文件**：通过 `express.static()` 服务 `dist/` 目录
3. **SPA 回退**：所有非 API 请求都返回 `index.html`

### 5. SPA 路由回退机制

React Router 使用 **客户端路由**，当用户直接访问 `https://your-domain.com/path` 时：

- **没有回退**：服务器返回 404（因为 `/path` 不是物理文件）
- **有回退**：服务器返回 `index.html`，React Router 在客户端处理路由

关键代码：

```typescript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})
```

**注意顺序**：这个路由必须放在所有 API 路由之后，否则 API 请求也会返回 HTML。

### 6. 环境变量配置

修改前：
```typescript
dotenv.config({ path: path.resolve(__dirname, '../.env.local'), override: true })
```

修改后：
```typescript
dotenv.config()
```

**原因**：
- 在 Docker 容器中，`.env.local` 文件不存在
- Coolify 通过环境变量注入配置
- `dotenv.config()` 会自动读取环境变量（优先级最高）

---

## 修改文件清单

### 新增文件

1. **[Dockerfile](file:///Volumes/project/开发中/yaofan/Dockerfile)** — Docker 构建配置
2. **[tsconfig.server.json](file:///Volumes/project/开发中/yaofan/tsconfig.server.json)** — 后端 TypeScript 编译配置
3. **[Coolify部署指南.md](file:///Volumes/project/开发中/yaofan/Coolify部署指南.md)** — 本文档

### 修改文件

1. **[package.json](file:///Volumes/project/开发中/yaofan/package.json)** — 修改 build 脚本
2. **[api/app.ts](file:///Volumes/project/开发中/yaofan/api/app.ts)** — 添加静态文件服务和 SPA 回退

---

## 流程图

### 1. 项目改造流程图

```mermaid
flowchart TD
    A[开始: Vercel Serverless 项目] --> B{问题分析}
    B --> C[缺少 Dockerfile]
    B --> D[API 入口是 Handler 函数]
    B --> E[前端静态资源由 Vercel 托管]
    B --> F[环境变量读取 .env.local]
    
    C --> G[创建 Dockerfile]
    D --> H[使用 api/server.ts 作为 HTTP 入口]
    E --> I[修改 api/app.ts 添加静态文件服务]
    E --> J[添加 SPA 回退路由]
    F --> K[修改 dotenv.config 路径]
    
    G --> L[创建 tsconfig.server.json]
    L --> M[修改 package.json build 脚本]
    H --> N[修改 api/app.ts 路由顺序]
    
    I --> O[验证构建]
    J --> O
    K --> O
    M --> O
    N --> O
    
    O --> P{构建成功?}
    P -->|是| Q[完成改造]
    P -->|否| R[修复编译错误]
    R --> O
```

### 2. Docker 多阶段构建流程图

```mermaid
flowchart LR
    subgraph Stage 1: Builder
        A1[node:20-alpine] --> A2[安装所有依赖 npm ci]
        A2 --> A3[编译 TypeScript tsc -p tsconfig.server.json]
        A3 --> A4[构建 Vite vite build]
        A4 --> A5[生成 dist/api/ 和 dist/assets/]
    end
    
    subgraph Stage 2: Runner
        B1[node:20-alpine] --> B2[安装生产依赖 npm ci --only=production]
        B2 --> B3[复制构建产物 COPY --from=builder]
        B3 --> B4[暴露端口 3001]
        B4 --> B5[启动应用 node dist/api/server.js]
    end
    
    A5 --> B3
```

### 3. Express 路由处理流程图

```mermaid
flowchart TD
    A[用户请求] --> B{请求路径是否以 /api/ 开头?}
    B -->|是| C{API 路由是否匹配?}
    C -->|是| D[处理 API 请求]
    C -->|否| E[返回 API 404 JSON]
    
    B -->|否| F{请求是否为静态文件?}
    F -->|是| G[返回静态资源]
    F -->|否| H[返回 index.html SPA 回退]
    
    D --> I[返回 JSON 响应]
    G --> J[返回文件内容]
    H --> K[React Router 处理客户端路由]
```

### 4. Coolify 部署流程图

```mermaid
flowchart TD
    A[开始] --> B[创建 PostgreSQL 数据库]
    B --> C[记录数据库连接 URL]
    
    C --> D[创建应用服务]
    D --> E[选择 Docker 类型]
    E --> F[连接 Git 仓库]
    F --> G[设置 Dockerfile 路径]
    
    G --> H[配置环境变量]
    H --> I[WXPAY_APP_ID]
    H --> J[WXPAY_MCH_ID]
    H --> K[WXPAY_PRIVATE_KEY]
    H --> L[DATABASE_URL]
    H --> M[其他变量]
    
    M --> N[点击 Deploy]
    N --> O[Coolify 拉取代码]
    O --> P[构建 Docker 镜像]
    P --> Q[运行容器]
    Q --> R[配置反向代理]
    R --> S[部署完成]
```

---

## Coolify 部署步骤

### 步骤 1：创建 PostgreSQL 数据库

在 Coolify 中：
1. 进入 **Services** → **Create Service**
2. 选择 **Database** → **PostgreSQL**
3. 设置数据库名称、用户名、密码
4. 记录数据库连接 URL（格式：`postgres://user:pass@host:port/dbname`）

### 步骤 2：创建应用服务

1. 进入 **Services** → **Create Service**
2. 选择 **Application** → **Docker**
3. 连接你的 Git 仓库
4. 设置 **Build Command**：不需要（使用 Dockerfile）
5. 设置 **Dockerfile Path**：`Dockerfile`

### 步骤 3：配置环境变量

在应用的 **Environment** 标签页添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `WXPAY_APP_ID` | 微信公众号 APPID |
| `WXPAY_MCH_ID` | 微信商户号 |
| `WXPAY_PRIVATE_KEY` | 商户私钥（PEM 格式） |
| `WXPAY_SERIAL_NO` | 证书序列号 |
| `WXPAY_API_V3_KEY` | API v3 密钥 |
| `WXPAY_NOTIFY_URL` | `https://your-domain.com/api/payment/notify` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `PORT` | `3001` |

### 步骤 4：部署

点击 **Deploy** 按钮，Coolify 会：
1. 拉取代码
2. 构建 Docker 镜像
3. 运行容器
4. 配置反向代理

---

## 常见问题

### Q1：构建失败，提示找不到模块

**原因**：后端 TypeScript 编译配置不正确。

**解决**：确保 `tsconfig.server.json` 中：
- `"noEmit": false`（允许输出 JS 文件）
- `"outDir": "./dist/api"`（输出到正确目录）
- `"moduleResolution": "node"`（使用 Node.js 模块解析）

### Q2：前端页面 404

**原因**：SPA 回退路由没有正确配置。

**解决**：检查 `api/app.ts` 中：
- `express.static()` 指向正确的静态文件目录
- `app.get('*')` 放在所有 API 路由之后

### Q3：环境变量不生效

**原因**：`.env.local` 文件路径在 Docker 中不存在。

**解决**：使用 `dotenv.config()` 不带参数，让它读取环境变量。

### Q4：数据库连接失败

**原因**：Supabase 配置不正确，或网络无法访问。

**解决**：
- 检查 `NEXT_PUBLIC_SUPABASE_URL` 是否正确（格式：`https://xxx.supabase.co`）
- 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确（需要完整密钥）
- 确保服务器能访问外网（Supabase 是云服务）
- 在 Supabase SQL Editor 中执行 `supabase/init.sql` 创建表

---

## 原理总结

将项目从 Vercel 迁移到 Coolify 的核心思想是：

1. **从 Serverless 函数转变为常驻 HTTP 服务器**：使用 `api/server.ts` 作为入口
2. **统一前端和后端服务**：Express 同时处理 API 和静态文件
3. **容器化打包**：使用 Docker 将应用及其依赖打包成镜像
4. **环境变量注入**：依赖 Coolify 的环境变量配置而非本地 `.env` 文件

理解这些原理后，你可以轻松将其他 Vercel 项目迁移到 Coolify 或其他容器化平台。