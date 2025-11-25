---
sidebar_position: 4
---

# 使用指南

本文档介绍 GitHub Release Manager 的所有功能和用法。

## 基础概念

### GitHub Release

GitHub Release 是 GitHub 提供的功能，用于发布软件版本。每个 Release 可以包含：
- 版本标签（tag）
- 发布说明
- 二进制文件（assets）

### Release Asset

Asset 是上传到 Release 的文件，例如：
- 编译好的二进制文件
- 源代码压缩包
- 文档
- 配置文件

## 命令概览

| 命令 | 描述 |
|------|------|
| `upload` | 上传文件到 Release |
| `delete` | 从 Release 中删除文件 |
| `update` | 更新文件（删除后重新上传） |
| `list` | 列出 Release 中的所有文件 |
| `create-release` | 创建新的 Release |
| `config` | 管理配置文件 |
| `help` | 显示帮助信息 |

## 上传文件 (upload)

### 基本用法

上传单个文件：

```bash
./manage upload backup.zip
```

上传多个文件：

```bash
./manage upload file1.zip file2.zip file3.zip
```

### 使用通配符

上传所有 `.zip` 文件：

```bash
./manage upload *.zip
```

上传所有以 `backup-` 开头的文件：

```bash
./manage upload backup-*
```

### 实际示例

```bash
# 上传所有压缩文件
./manage upload *.zip *.tar.gz *.tar.xz

# 上传构建产物
./manage upload dist/* build/*

# 上传日志文件
./manage upload logs/*.log
```

### 输出示例

```
准备批量上传 3 个文件...

[1/3] 准备上传文件 "backup-2024-01-01.zip" (10485760 bytes)...
上传到: https://uploads.github.com/repos/...?name=backup-2024-01-01.zip

✅ 文件上传成功!
   - Asset ID: 123456789
   - 下载链接: https://github.com/.../download/...

[2/3] 准备上传文件 "backup-2024-01-02.zip" (8388608 bytes)...
...

===================================
批量上传完成:
  成功: 3
  失败: 0
===================================
```

## 删除文件 (delete)

### 基本用法

删除单个文件：

```bash
./manage delete oldfile.zip
```

删除多个文件：

```bash
./manage delete file1.tmp file2.tmp
```

### 使用通配符

删除所有 `.tmp` 文件：

```bash
./manage delete *.tmp
```

### 实际示例

```bash
# 删除旧的备份文件
./manage delete backup-2023-*.zip

# 删除临时文件
./manage delete *.tmp *.log

# 删除特定模式的文件
./manage delete debug-*-old.bin
```

### 输出示例

```
准备批量删除 2 个文件...

[1/2] 找到文件 "oldfile.zip" (ID: 123456789)，正在删除...

✅ 文件 "oldfile.zip" 删除成功!

[2/2] 找到文件 "temp.log" (ID: 987654321)，正在删除...

✅ 文件 "temp.log" 删除成功!

===================================
批量删除完成:
  成功: 2
  失败: 0
===================================
```

## 列出文件 (list)

列出 Release 中的所有文件：

```bash
./manage list
```

### 输出示例

```
使用Release Tag: v1.0.0
使用Release ID: 123456789
Release 中的文件列表:
文件名                                     大小(bytes)     下载次数
--------------------------------------------------------------------------
backup-2024-01-01.zip                       10485760          42
backup-2024-01-02.zip                        8388608          38
app-linux-amd64.tar.gz                      25165824         156
app-windows-amd64.zip                       33554432          89
README.md                                     204800         234
```

## 更新文件 (update)

更新操作会先删除 Release 中的旧文件，然后上传新文件。这在文件已存在但需要替换时非常有用。

### 基本用法

更新单个文件：

```bash
./manage update newbackup.zip
```

更新多个文件：

```bash
./manage update file1.zip file2.zip
```

### 使用通配符

更新所有 `.zip` 文件：

```bash
./manage update *.zip
```

### 实际示例

```bash
# 更新构建产物
./manage update build/*

# 更新配置文件
./manage update config/production.conf

# 更新文档
./manage update docs/*.pdf
```

### 工作原理

1. 检查文件是否存在于 Release 中
2. 如果存在，删除旧文件
3. 上传新文件
4. 如果文件不存在，直接上传

### 输出示例

```
准备更新文件 "newbackup.zip"...
找到文件 "newbackup.zip" (ID: 123456789)，正在删除...

✅ 文件 "newbackup.zip" 删除成功!
准备上传文件 "newbackup.zip" (11534336 bytes)...
上传到: https://uploads.github.com/repos/...?name=newbackup.zip

✅ 文件上传成功!

✅ 文件 "newbackup.zip" 更新成功!
```

## 创建 Release (create-release)

创建新的 GitHub Release 并可选上传文件。

### 基本用法

```bash
./manage create-release v1.0.0
```

### 带选项的用法

```bash
# 创建带自定义名称的 Release
./manage create-release v1.0.0 --name "Version 1.0"

# 创建带描述的 Release
./manage create-release v1.0.0 --name "Version 1.0" \
  --description "First stable release with new features"

# 创建预发布版本
./manage create-release v1.0.0-beta --prerelease

# 创建 Release 并上传文件
./manage create-release v1.0.0 file1.zip file2.zip

# 使用通配符上传文件
./manage create-release v1.0.0 *.zip
```

### 选项说明

| 选项 | 简写 | 描述 |
|------|------|------|
| `--name` | `-n` | Release 名称（默认使用 tag） |
| `--description` | `-d` | Release 描述 |
| `--prerelease` | `-p` | 标记为预发布版本 |

### 完整示例

```bash
# 创建正式版本并上传所有构建文件
./manage create-release v1.0.0 \
  --name "Release 1.0" \
  --description "Stable release with performance improvements" \
  --prerelease=false \
  build/* docs/*.pdf

# 创建测试版本
./manage create-release v1.0.0-beta \
  --name "Beta Release" \
  --description "Beta version for testing" \
  --prerelease \
  app-beta.zip
```

### 输出示例

```
正在创建新的 Release，标签: v1.0.0...
✅ Release 创建成功!
   - 标签: v1.0.0
   - ID: 123456789

准备上传文件到新创建的 Release...
[1/2] 准备上传文件 "app-linux.tar.gz" (25165824 bytes)...
...
✅ 文件上传成功!

[2/2] 准备上传文件 "app-windows.zip" (33554432 bytes)...
...
✅ 文件上传成功!

===================================
批量上传完成:
  成功: 2
  失败: 0
===================================
```

## 配置管理 (config)

### 显示配置

查看当前配置：

```bash
./manage config show
```

输出：

```
当前配置:
  owner: myusername
  repo: my-app
  token: 已设置(隐藏)
  tag_name: v1.0.0
  config_file: ./.manage_config.json
  优先级: 命令行参数 > 环境变量 > 配置文件 > 默认值
```

### 初始化配置文件

在当前目录创建默认配置文件：

```bash
./manage config init
```

这会创建 `.manage_config.json` 文件。

### 设置配置项

修改配置文件中的配置项：

```bash
# 设置仓库所有者
./manage config set owner myusername

# 设置仓库名
./manage config set repo my-app

# 设置 token
./manage config set token ghp_your_token_here

# 设置默认 tag
./manage config set tag_name v1.0.0
```

**注意**：这只会修改配置文件，不会影响环境变量。

## 帮助信息 (help)

显示详细的命令说明：

```bash
./manage help
```

这会显示所有命令的用法、选项和示例。

## 实际应用示例

### 示例 1：备份脚本

```bash
#!/bin/bash
# backup.sh

# 创建备份
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/data

# 上传到 GitHub Release
./manage upload backup-$(date +%Y%m%d).tar.gz

# 删除 30 天前的旧备份
./manage delete backup-$(date -d "30 days ago" +%Y%m%d).tar.gz
```

### 示例 2：发布脚本

```bash
#!/bin/bash
# release.sh

VERSION=$1

# 构建应用
make build VERSION=$VERSION

# 创建 Release 并上传文件
./manage create-release $VERSION \
  --name "Release $VERSION" \
  --description "New features and bug fixes" \
  build/*
```

### 示例 3：清理临时文件

```bash
#!/bin/bash
# cleanup.sh

# 删除所有临时文件
./manage delete *.tmp *.log debug-*-old.zip

# 列出剩余文件
./manage list
```

## 批量操作的最佳实践

1. **测试模式**：先使用 `list` 查看当前文件
2. **小心通配符**：建议先用 `echo` 测试通配符匹配
   ```bash
   echo *.zip  # 查看哪些文件会被匹配
   ./manage upload *.zip
   ```
3. **分批处理**：大量文件可以分批上传，避免超时
4. **错误处理**：检查返回码，在脚本中添加错误处理
   ```bash
   if ! ./manage upload *.zip; then
       echo "上传失败！"
       exit 1
   fi
   ```

## 常见问题

### 上传失败

**原因**：文件过大（GitHub 限制单个文件 2GB）

**解决**：压缩文件或分卷压缩

### 删除失败

**原因**：文件不存在或名称错误

**解决**：先使用 `./manage list` 查看准确的文件名

### 找不到 Release

**原因**：未指定 tag_name 或没有可用的 Release

**解决**：
1. 使用 `./manage create-release v1.0.0` 创建新 Release
2. 或设置 `GITHUB_TAG` 环境变量

## 重试机制

工具内置了自动重试机制：
- 最大重试次数：3 次
- 指数退避延迟
- 随机抖动避免所有客户端同时重试

网络问题或临时性错误会自动重试，无需手动干预。
