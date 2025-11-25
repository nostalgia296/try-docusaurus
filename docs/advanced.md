---
sidebar_position: 6
---

# 高级主题

本文档介绍 GitHub Release Manager 的高级用法和最佳实践。

## 高级功能

### 通配符匹配

工具支持标准的 Unix 通配符模式：

- `*` - 匹配任意数量的字符
- `?` - 匹配单个字符
- `[abc]` - 匹配方括号内的任意字符
- `[a-z]` - 匹配指定范围内的任意字符

#### 示例

```bash
# 匹配所有 .zip 文件
./manage upload *.zip

# 匹配以 backup- 开头，日期为 2024-01-xx 的文件
./manage upload backup-2024-01-*.zip

# 匹配单个字符变化
./manage upload file?.txt  # 匹配 file1.txt, file2.txt 等

# 匹配方括号内的任意字符
./manage upload file[123].txt  # 匹配 file1.txt, file2.txt, file3.txt
```

### 批量操作优化

#### 1. 大批量文件处理

处理大量文件时（> 100 个），建议分批处理：

```bash
#!/bin/bash
# batch_upload.sh

# 每批 50 个文件分批上传
FILES=(*.zip)
BATCH_SIZE=50

for ((i=0; i<${#FILES[@]}; i+=BATCH_SIZE)); do
    BATCH=(${FILES[@]:i:BATCH_SIZE})
    ./manage upload "${BATCH[@]}"
done
```

#### 2. 并行处理

使用 GNU parallel 进行并行上传：

```bash
# 安装 parallel（Ubuntu/Debian）
sudo apt-get install parallel

# 并行上传（最多 4 个并发）
ls *.zip | parallel -j 4 ./manage upload {}
```

#### 3. 错误处理和重试

在脚本中处理错误：

```bash
#!/bin/bash

# 上传文件，失败时重试 3 次
upload_with_retry() {
    local file=$1
    local retries=3
    local count=0

    until ./manage upload "$file"; do
        ((count++))
        if [ $count -ge $retries ]; then
            echo "上传 $file 失败!")
            return 1
        fi
        echo "重试 $count/$retries..."
        sleep 5
done
}

# 上传所有 zip 文件
for file in *.zip; do
    upload_with_retry "$file"
done
```

## 安全性最佳实践

### 1. Token 安全管理

#### 方案 A：使用 Token 文件（推荐）

```bash
# 1. 创建 token 文件
echo "ghp_your_token_here" > ~/.github_token
chmod 600 ~/.github_token

# 2. 设置环境变量
export GITHUB_TOKEN_FILE="$HOME/.github_token"

# 3. 验证权限
ls -la ~/.github_token
# 应该显示：-rw-------
```

#### 方案 B：使用密钥管理服务

在 CI/CD 环境中使用密钥管理：

```bash
# GitHub Actions
export GITHUB_TOKEN="${{ secrets.GITHUB_TOKEN }}"

# GitLab CI
export GITHUB_TOKEN="$GITHUB_TOKEN"

# AWS Secrets Manager
export GITHUB_TOKEN=$(aws secretsmanager get-secret-value \
  --secret-id github-token \
  --query SecretString \
  --output text)
```

#### 方案 C：使用 GNU Pass

```bash
# 安装 pass
sudo apt-get install pass

# 存储 token
pass insert github-token
# 输入: ghp_your_token_here

# 使用 token
export GITHUB_TOKEN=$(pass github-token)
```

### 2. 配置文件权限

始终设置配置文件的权限：

```bash
# 创建配置文件
./manage config init

# 检查当前权限
ls -la .manage_config.json

# 设置安全权限（仅所有者可读写）
chmod 600 .manage_config.json

# 验证权限
ls -la .manage_config.json
# 应该显示：-rw-------
```

### 3. 避免在命令行中暴露 Token

**不推荐**：

```bash
# 不要在命令行中直接写 token
./manage config set token ghp_my_token_here  # 会在 shell 历史中保存
```

**推荐**：

```bash
# 方法 1：从文件读取
echo ghp_my_token_here > token_file
./manage config set token $(cat token_file)
rm token_file

# 方法 2：环境变量
export GITHUB_TOKEN="ghp_my_token_here"
```

### 4. 审计和日志

设置适当的日志级别进行审计：

```bash
# 记录所有操作
export MANAGE_LOG_LEVEL=0  # DEBUG 级别
./manage upload *.zip 2> operation.log

# 查看日志
cat operation.log
```

## CI/CD 集成高级用法

### GitHub Actions 完整示例

```yaml
name: Release Management

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: '版本号'
        required: true
        type: string

env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  GITHUB_OWNER: ${{ github.repository_owner }}
  GITHUB_REPO: ${{ github.event.repository.name }}

jobs:
  build-and-upload:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y libcurl4-openssl-dev libjson-c-dev

      - name: Compile GitHub Release Manager
        run: |
          gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c)

      - name: Build application
        run: |
          make build VERSION=${{ github.event.inputs.version || github.ref_name }}

      - name: Create Release
        if: github.event_name == 'push'
        run: |
          ./manage create-release ${{ github.ref_name }} \
            --name "Release ${{ github.ref_name }}" \
            --description "Auto-generated release" \
            build/*

      - name: Upload files
        if: github.event_name == 'workflow_dispatch'
        run: |
          ./manage upload build/*

      - name: List Release files
        run: |
          ./manage list
```

### GitLab CI 完整示例

```yaml
stages:
  - build
  - release

variables:
  GITHUB_TOKEN: $GITHUB_TOKEN
  GITHUB_OWNER: "your-username"
  GITHUB_REPO: "your-repo"

before_script:
  - apt-get update -qq
  - apt-get install -y build-essential libcurl4-openssl-dev libjson-c-dev
  - gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c)

build:
  stage: build
  script:
    - make build VERSION=$CI_COMMIT_TAG
  artifacts:
    paths:
      - build/
    expire_in: 1 week

create:release:
  stage: release
  only:
    - tags
  script:
    - ./manage create-release $CI_COMMIT_TAG \
        --name "Release $CI_COMMIT_TAG" \
        --description "Release from GitLab CI" \
        build/*

upload:artifacts:
  stage: release
  only:
    - main
  script:
    - ./manage upload build/*
```

### Jenkins Pipeline 示例

```groovy
pipeline {
    agent any

    environment {
        GITHUB_TOKEN = credentials('github-token')
        GITHUB_OWNER = 'your-username'
        GITHUB_REPO = 'your-repo'
    }

    stages {
        stage('Build') {
            steps {
                sh 'make build'
            }
        }

        stage('Compile Release Manager') {
            steps {
                sh '''
                    gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c)
                '''
            }
        }

        stage('Create Release') {
            when {
                buildingTag()
            }
            steps {
                sh '''
                    ./manage create-release ${TAG_NAME} \
                        --name "Release ${TAG_NAME}" \
                        build/*
                '''
            }
        }

        stage('Upload Artifacts') {
            steps {
                sh './manage upload build/*'
            }
        }
    }
}
```

## 性能优化

### 1. 启用 HTTP/2

编译时启用 HTTP/2（如果 libcurl 支持）：

```bash
gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c) \
  -DCURL_HTTP_VERSION_2TLS
```

### 2. 调整缓冲区大小

修改源代码中的缓冲区大小（如果需要上传超大文件）：

```c
// 在 manage.c 中找到以下行并调整
#define UPLOAD_BUFFER_SIZE 8192  // 增大缓冲区
```

### 3. 网络优化

在高延迟网络环境中：

```bash
# 减少重试延迟（修改源代码中的 baseDelay）
static int baseDelay = 1;  // 从 1 秒开始

# 增加超时时间
# 在 curl 设置中添加
curl_easy_setopt(curl, CURLOPT_TIMEOUT, 300L);  // 5 分钟超时
```

### 4. 压缩文件

上传前压缩大文件：

```bash
#!/bin/bash
# compress-and-upload.sh

# 压缩文件（使用并行压缩）
tar -I 'pigz -p 4' -cf archive.tar.gz data/

# 上传压缩文件
./manage upload archive.tar.gz
```

## 故障排除

### 问题 1：上传速度慢

**原因**：网络延迟或带宽限制

**解决方案**：
1. 压缩文件
2. 使用多线程上传工具
3. 选择就近的 GitHub 数据中心

### 问题 2：频繁触发 API 限制

**原因**：批量操作过于频繁

**解决方案**：
1. 增加延迟（工具已自动添加 0.1 秒延迟）
2. 减少并发数
3. 联系 GitHub 提高 API 限制

### 问题 3：大文件上传失败

**原因**：网络超时或文件大小限制

**解决方案**：
1. 分割大文件：`split -b 100M largefile.bin part-`
2. 增加超时时间
3. 确保文件 < 2GB（GitHub 限制）

### 问题 4：Token 权限不足

**错误**：`404 Not Found` 或 `403 Forbidden`

**解决方案**：
1. 检查 token 是否有 `repo` 作用域
2. 检查仓库是否存在
3. 检查是否有写入权限

### 问题 5：Release 不存在

**错误**：`未找到tag为 "v1.0.0" 的release`

**解决方案**：
```bash
# 先创建 Release
./manage create-release v1.0.0

# 然后上传文件
./manage upload *.zip
```

## 监控和日志

### 详细日志

启用调试日志：

```bash
# 设置日志级别为 DEBUG
export MANAGE_LOG_LEVEL=0

# 重定向日志到文件
./manage upload *.zip 2> debug.log

# 查看实时日志
tail -f debug.log
```

### JSON 日志格式

对于日志收集系统，可以修改源代码输出 JSON 格式：

```c
// 修改 log_message 函数输出 JSON
fprintf(stderr, "{\"level\":\"%s\",\"message\":\"", level_strs[level]);
vfprintf(stderr, fmt, args);
fprintf(stderr, "\"}\n");
```

### 监控脚本

```bash
#!/bin/bash
# monitor.sh

LOG_FILE="/var/log/github-release-manager.log"

# 监控上传操作
upload_and_log() {
    local files=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$timestamp] Starting upload: $files" >> $LOG_FILE

    if ./manage upload $files; then
        echo "[$timestamp] Upload success: $files" >> $LOG_FILE
        return 0
    else
        echo "[$timestamp] Upload failed: $files" >> $LOG_FILE
        return 1
    fi
}

# 使用示例
upload_and_log "*.zip"
```

## 自定义和扩展

### 添加新功能

要添加新命令，需要：

1. 实现功能函数：

```c
// 在 manage.c 中添加
static ErrorCode myNewCommand(const char *param, const Config *config) {
    // 实现功能
    return ERR_OK;
}
```

2. 在主函数中添加命令处理：

```c
// 在 main 函数的命令处理部分
else if (strcmp(command, "my-command") == 0) {
    // 调用你的函数
}
```

3. 更新帮助信息（`showUsage` 和 `showDetailedUsage` 函数）

### 编译选项

编译时添加自定义选项：

```bash
# 启用所有警告

gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c) \
  -Wall -Wextra -Wpedantic -O2

# 静态链接（生成独立可执行文件，不推荐，但可能在某些环境需要）

gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c) \
  -static -O2
```
