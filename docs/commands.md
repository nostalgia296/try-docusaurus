---
sidebar_position: 5
---

# 命令参考

本文档提供所有可用命令的详细说明。

## 命令列表

- [upload](#upload) - 上传文件到 Release
- [delete](#delete) - 从 Release 删除文件
- [update](#update) - 更新 Release 中的文件
- [list](#list) - 列出 Release 中的文件
- [create-release](#create-release) - 创建新的 Release
- [config](#config) - 管理配置
- [help](#help) - 显示帮助信息

## 命令详解

### `upload`

上传一个或多个文件到 GitHub Release。

#### 语法

```bash
./manage upload <文件路径> [文件路径2] [文件路径3 ...]
```

#### 参数

| 参数 | 必需 | 描述 |
|------|------|------|
| `文件路径` | 是 | 要上传的文件路径，支持通配符 `*` 和 `?` |

#### 示例

```bash
# 上传单个文件
./manage upload backup.zip

# 上传多个文件
./manage upload file1.zip file2.zip

# 使用通配符上传所有 zip 文件
./manage upload *.zip

# 上传所有压缩文件
./manage upload *.tar.gz *.zip *.tar.xz
```

#### 返回码

- `0` - 所有文件上传成功
- `1` - 部分或全部文件上传失败

#### 输出

```
准备批量上传 N 个文件...

[x/N] 准备上传文件 "filename" (SIZE bytes)...
上传到: https://uploads.github.com/...

✅ 文件上传成功!
   - Asset ID: ID
   - 下载链接: URL

==================================
批量上传完成:
  成功: N
  失败: M
==================================
```

### `delete`

从 Release 中删除一个或多个文件。

#### 语法

```bash
./manage delete <文件名> [文件名2] [文件名3 ...]
```

#### 参数

| 参数 | 必需 | 描述 |
|------|------|------|
| `文件名` | 是 | 要删除的文件名（仅文件名，不包含路径），支持通配符 |

#### 示例

```bash
# 删除单个文件
./manage delete oldfile.zip

# 删除多个文件
./manage delete file1.tmp file2.tmp

# 删除所有临时文件
./manage delete *.tmp

# 删除特定模式的文件
./manage delete debug-*-old.zip
```

#### 返回码

- `0` - 所有文件删除成功
- `1` - 部分或全部文件删除失败

#### 输出

```
准备批量删除 N 个文件...

[x/N] 找到文件 "filename" (ID: ID)，正在删除...

✅ 文件 "filename" 删除成功!

==================================
批量删除完成:
  成功: N
  失败: M
==================================
```

### `update`

更新 Release 中的文件。此操作会先删除旧文件，然后上传新文件。

#### 语法

```bash
./manage update <文件路径> [文件路径2] [文件路径3 ...]
```

#### 参数

| 参数 | 必需 | 描述 |
|------|------|------|
| `文件路径` | 是 | 要更新的文件路径（本地文件），支持通配符 |

#### 说明

- 如果文件已存在于 Release 中，先删除旧版本
- 如果文件不存在，直接上传新版本
- 适用于替换已存在的文件

#### 示例

```bash
# 更新单个文件
./manage update newbackup.zip

# 更新多个文件
./manage update file1.zip file2.zip

# 更新所有 zip 文件
./manage update *.zip

# 更新构建产物
./manage update build/*
```

#### 返回码

- `0` - 所有文件更新成功
- `1` - 部分或全部文件更新失败

#### 输出

```
准备更新文件 "filename"...
找到文件 "filename" (ID: ID)，正在删除...

✅ 文件 "filename" 删除成功!
准备上传文件 "filename" (SIZE bytes)...
上传到: https://uploads.github.com/...

✅ 文件上传成功!

✅ 文件 "filename" 更新成功!
```

### `list`

列出 Release 中的所有文件及其信息。

#### 语法

```bash
./manage list
```

#### 参数

无参数

#### 输出信息

对于每个文件，显示：
- 文件名
- 文件大小（bytes）
- 下载次数

#### 示例

```bash
./manage list
```

#### 输出

```
使用Release Tag: v1.0.0
使用Release ID: 123456789
Release 中的文件列表:
文件名                                     大小(bytes)     下载次数
--------------------------------------------------------------------------
backup-2024-01-01.zip                       10485760          42
backup-2024-01-02.zip                        8388608          38
app-linux-amd64.tar.gz                      25165824         156
```

### `create-release`

创建新的 GitHub Release，并可选择性地上传文件。

#### 语法

```bash
./manage create-release <tag_name> [选项] [文件...]
```

#### 参数

| 参数 | 必需 | 描述 |
|------|------|------|
| `tag_name` | 是 | Release 的标签名（如 `v1.0.0`） |
| `文件...` | 否 | 创建 Release 后上传的文件路径，支持通配符 |

#### 选项

| 选项 | 简写 | 描述 |
|------|------|------|
| `--name <name>` | `-n` | Release 名称（默认使用 tag_name） |
| `--description <desc>` | `-d` | Release 描述 |
| `--prerelease` | `-p` | 标记为预发布版本 |

#### 示例

```bash
# 创建简单的 Release
./manage create-release v1.0.0

# 创建带自定义名称的 Release
./manage create-release v1.0.0 --name "Version 1.0"

# 创建带描述的 Release
./manage create-release v1.0.0 \
  --name "Version 1.0" \
  --description "First stable release"

# 创建预发布版本
./manage create-release v1.0.0-beta --prerelease

# 创建 Release 并上传文件
./manage create-release v1.0.0 app.zip docs.pdf

# 创建 Release 并使用通配符上传文件
./manage create-release v1.0.0 *.zip
```

#### 返回码

- `0` - Release 创建成功（文件上传可选）
- `1` - Release 创建失败

#### 输出

```
正在创建新的 Release，标签: v1.0.0...
✅ Release 创建成功!
   - 标签: v1.0.0
   - ID: 123456789

准备上传文件到新创建的 Release...
[1/N] 准备上传文件 "filename"...
✅ 文件上传成功!
...
```

### `config`

管理配置文件。

#### 子命令

- `show` - 显示当前配置
- `init` - 初始化配置文件
- `set <key> <value>` - 设置配置项

#### 语法

```bash
./manage config show
./manage config init
./manage config set <key> <value>
```

#### 支持的配置项

| 配置项 | 描述 |
|--------|------|
| `owner` | GitHub 仓库所有者 |
| `repo` | GitHub 仓库名 |
| `token` | GitHub API 令牌 |
| `tag_name` | 要操作的 Release Tag |

#### 示例

```bash
# 显示当前配置
./manage config show

# 初始化配置文件（创建 .manage_config.json）
./manage config init

# 设置配置项
./manage config set owner myusername
./manage config set repo my-app
./manage config set token ghp_token_here
./manage config set tag_name v1.0.0
```

#### 输出

```
当前配置:
  owner: myusername
  repo: my-app
  token: 已设置(隐藏)
  tag_name: v1.0.0
  config_file: ./.manage_config.json
  优先级: 命令行参数 > 环境变量 > 配置文件 > 默认值
```

### `help`

显示详细的帮助信息和使用说明。

#### 语法

```bash
./manage help
```

#### 输出

显示所有命令的详细说明、环境变量、配置文件格式等信息。

## 配置优先级

命令使用配置的优先级（从低到高）：

1. **配置文件** (`.manage_config.json`)
2. **环境变量** (`GITHUB_TOKEN`, `GITHUB_OWNER`, etc.)
3. **命令行参数**（如 `create-release` 的选项）

## 环境变量

### 必需

- `GITHUB_TOKEN` - GitHub Personal Access Token
  - 或者使用 `GITHUB_TOKEN_FILE` 指定 token 文件路径

### 可选

- `GITHUB_OWNER` - GitHub 仓库所有者（默认: `nostalgia296`）
- `GITHUB_REPO` - GitHub 仓库名（默认: `backup`）
- `GITHUB_TAG` - 指定操作的 Release Tag（可选）
- `MANAGE_LOG_LEVEL` - 日志级别（0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL）

## 返回码

所有命令都返回以下状态码：

- `0` - 成功
- `1` - 失败

## 重试机制

工具内置自动重试机制：

- 最大重试次数：3 次
- 重试的错误类型：网络错误、HTTP 5xx 错误、内存错误
- 使用指数退避算法

重试过程对用戶透明，无需特别处理。

## 快速参考表

### 常见操作速查表

| 操作 | 命令 |
|------|------|
| 上传所有 zip 文件 | `./manage upload *.zip` |
| 删除所有 tmp 文件 | `./manage delete *.tmp` |
| 更新所有 zip 文件 | `./manage update *.zip` |
| 创建正式 Release | `./manage create-release v1.0.0` |
| 创建预发布 | `./manage create-release v1.0-beta -p` |
| 创建 Release 并上传 | `./manage create-release v1.0.0 *.zip` |
| 查看配置 | `./manage config show` |

### CI/CD 集成速查表

```bash
# 设置环境变量
export GITHUB_TOKEN="${{ secrets.GITHUB_TOKEN }}"
export GITHUB_OWNER="myusername"
export GITHUB_REPO="my-app"

# 上传构建产物
./manage upload build/*

# 创建 Release
./manage create-release ${VERSION} build/*
```
