---
sidebar_position: 3
---

# 配置说明

GitHub Release Manager 支持多种配置方式，配置优先级从低到高为：

**配置文件 < 环境变量 < 命令行参数**

## 配置方式

### 1. 环境变量（推荐）

这是最常用的配置方式，特别适合在 CI/CD 环境中使用。

#### 必需的环境变量

```bash
# GitHub Personal Access Token（必需）
export GITHUB_TOKEN="ghp_your_personal_access_token_here"

# 或者从文件读取 token（更安全）
export GITHUB_TOKEN_FILE="/path/to/token_file"
```

#### 可选的环境变量

```bash
# GitHub 仓库所有者（默认: nostalgia296）
export GITHUB_OWNER="your_username"

# GitHub 仓库名（默认: backup）
export GITHUB_REPO="your-repo"

# 指定要操作的 Release Tag（可选，未指定时使用最新 Release）
export GITHUB_TAG="v1.0.0"

# 日志级别（0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL）
export MANAGE_LOG_LEVEL="1"
```

### 2. 配置文件

配置文件支持 JSON 格式，可以从以下位置自动加载（按顺序）：

#### 配置文件查找路径

**当前目录**：
- `.manage_config.json`
- `manage_config.json`
- `.github_manage_config.json`

**用户主目录**（`~/.config/` 或 `~/`）：
- `.manage_config.json`
- `manage_config.json`
- `.github_manage_config.json`

#### 配置文件格式

创建配置文件 `.manage_config.json`：

```json
{
  "owner": "your_username",
  "repo": "your-repo",
  "token": "ghp_your_personal_access_token_here",
  "tag_name": "v1.0.0"
}
```

#### 配置文件管理命令

```bash
# 显示当前配置
./manage config show

# 初始化配置文件（在当前目录创建 .manage_config.json）
./manage config init

# 设置配置项
./manage config set owner your_username
./manage config set repo your-repo
./manage config set token your_token_here
./manage config set tag_name v1.0.0
```

**注意**：配置文件中的 token 会以明文保存，请确保设置合适的文件权限：

```bash
chmod 600 .manage_config.json
```

### 3. 默认配置

如果未设置任何配置，工具使用以下默认值：

- **owner**: `nostalgia296`
- **repo**: `backup`
- **tag_name**: `null`（使用最新 Release）

## 配置优先级

配置系统按以下优先级使用配置值（从高到低）：

1. **命令行参数**（某些操作支持）
2. **环境变量**（最高优先级）
3. **配置文件**（中等优先级）
4. **默认值**（最低优先级）

## 示例配置

### 示例 1：使用环境变量

```bash
#!/bin/bash
# setup.sh

export GITHUB_TOKEN="ghp_your_token_here"
export GITHUB_OWNER="myusername"
export GITHUB_REPO="my-backup-repo"

./manage list
./manage upload backup.zip
```

### 示例 2：使用配置文件

```bash
# 1. 创建配置文件
cat > .manage_config.json << EOF
{
  "owner": "myusername",
  "repo": "my-app",
  "token": "ghp_your_token_here"
}
EOF

# 2. 设置文件权限
chmod 600 .manage_config.json

# 3. 使用工具
./manage list
./manage upload *.zip
```

### 示例 3：混合使用

```bash
# 在 .manage_config.json 中设置大部分配置
{
  "owner": "myusername",
  "repo": "my-app",
  "token": "ghp_your_token_here"
}

# 在命令行中通过环境变量覆盖 tag_name
export GITHUB_TAG="v1.0.0"
./manage upload release.zip  # 上传到 v1.0.0 Release
```

### 示例 4：Token 文件（更安全）

```bash
# 1. 将 token 保存到文件
echo "ghp_your_token_here" > ~/.github_token
chmod 600 ~/.github_token

# 2. 设置环境变量指向 token 文件
export GITHUB_TOKEN_FILE="$HOME/.github_token"

# 3. 使用工具（无需在配置文件中存储 token）
./manage list
./manage upload backup.zip
```

## Token 安全建议

1. **优先使用环境变量**：特别是在 CI/CD 环境中
2. **使用 Token 文件**：避免在配置文件中存储明文 token
3. **设置文件权限**：如果使用配置文件存储 token，确保权限为 600（仅所有者可读写）
4. **不要在版本控制中提交**：将配置文件添加到 `.gitignore`
5. **定期轮换 token**：定期更新 GitHub Personal Access Token
6. **使用最小权限原则**：为 token 只授予必要的权限（通常是 `repo` 作用域）

示例 `.gitignore`：

```gitignore
# GitHub Release Manager 配置文件
.manage_config.json
github_manage_config.json
.github_token
*.token
```

## 配置验证

工具会自动验证配置。如果配置不完整或错误，会显示详细的错误信息：

```bash
# 成功的配置验证
./manage list
使用Release Tag: v1.0.0
使用Release ID: 123456789
Release 中的文件列表:
文件名                                     大小(bytes)     下载次数
---------------------------------------------------------------------------
backup.zip                                   10485760       42

# 配置错误示例
./manage list
错误：未设置 GitHub token
错误：可以使用以下方式之一设置:
  1. export GITHUB_TOKEN=your_token_here
  2. export GITHUB_TOKEN_FILE=/path/to/token_file
  3. 在配置文件中设置
  然后将 token 写入文件并设置权限: chmod 600 token_file
```

## 查看当前配置

使用以下命令查看当前生效的配置：

```bash
./manage config show
```

输出示例：

```
当前配置:
  owner: myusername
  repo: my-app
  token: 已设置(隐藏)
  tag_name: v1.0.0
  config_file: ./.manage_config.json
  优先级: 命令行参数 > 环境变量 > 配置文件 > 默认值
```

## CI/CD 集成

在 CI/CD 环境中，推荐使用环境变量配置：

### GitHub Actions 示例

```yaml
name: Upload to Release

on:
  push:
    tags:
      - 'v*'

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build
        run: |
          # 构建你的项目
          make build

      - name: Install GitHub Release Manager
        run: |
          gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c)

      - name: Upload to Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_OWNER: ${{ github.repository_owner }}
          GITHUB_REPO: ${{ github.event.repository.name }}
        run: |
          ./manage upload build/*.zip
```

### GitLab CI 示例

```yaml
upload:release:
  stage: deploy
  script:
    - gcc manage.c -o manage $(pkg-config --cflags --libs libcurl json-c)
    - ./manage upload build/*.zip
  variables:
    GITHUB_TOKEN: $GITHUB_TOKEN
    GITHUB_OWNER: "your-username"
    GITHUB_REPO: "your-repo"
```
