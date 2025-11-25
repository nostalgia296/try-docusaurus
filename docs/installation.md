---
sidebar_position: 2
---

# 安装指南

## 前提条件

在编译和使用 GitHub Release Manager 之前，请确保你的系统已安装以下依赖：

### 必需依赖

- **GCC 编译器**: 用于编译 C 代码
  ```bash
  # Ubuntu/Debian
  sudo apt-get install build-essential

  # CentOS/RHEL
  sudo yum install gcc

  # macOS
  xcode-select --install
  ```

- **libcurl**: 用于 HTTP 请求
  ```bash
  # Ubuntu/Debian
  sudo apt-get install libcurl4-openssl-dev

  # CentOS/RHEL
  sudo yum install libcurl-devel

  # macOS (使用 Homebrew)
  brew install curl
  ```

- **json-c**: 用于 JSON 解析
  ```bash
  # Ubuntu/Debian
  sudo apt-get install libjson-c-dev

  # CentOS/RHEL
  sudo yum install json-c-devel

  # macOS (使用 Homebrew)
  brew install json-c
  ```

### 可选依赖

- **pkg-config**: 帮助编译器找到库文件
  ```bash
  # Ubuntu/Debian
  sudo apt-get install pkg-config

  # CentOS/RHEL
  sudo yum install pkg-config
  ```

## 编译步骤

### 方法一：使用 Makefile（推荐）

如果项目包含 Makefile，使用以下命令编译：

```bash
make
```

### 方法二：手动编译

如果项目不包含 Makefile，使用以下命令手动编译：

```bash
gcc manage.c -o manage \
  $(pkg-config --cflags --libs libcurl) \
  $(pkg-config --cflags --libs json-c) \
  -Wall -Wextra -O2
```

如果没有安装 pkg-config，需要手动指定库路径：

```bash
gcc manage.c -o manage \
  -lcurl -ljson-c \
  -Wall -Wextra -O2
```

在 macOS 上，如果通过 Homebrew 安装：

```bash
gcc manage.c -o manage \
  $(pkg-config --cflags --libs libcurl json-c) \
  -Wall -Wextra -O2
```

### 方法三：使用 shell 脚本

创建一个简单的编译脚本 `build.sh`：

```bash
#!/bin/bash
echo "编译 GitHub Release Manager..."
gcc manage.c -o manage \
  $(pkg-config --cflags --libs libcurl json-c) \
  -Wall -Wextra -O2

if [ $? -eq 0 ]; then
    echo "编译成功！生成的可执行文件: ./manage"
else
    echo "编译失败！"
    exit 1
fi
```

然后执行：

```bash
chmod +x build.sh
./build.sh
```

## 验证安装

编译完成后，验证程序是否正常工作：

```bash
./manage help
```

如果看到帮助信息，说明安装成功。

## 获取 GitHub Token

要使用此工具，你需要 GitHub Personal Access Token：

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 选择 `repo` 作用域（对于私有仓库）
4. 生成并复制 token
5. 安全地保存 token（建议使用配置文件，详见 [配置](configuration.md)）

## 后续步骤

- 阅读 [配置](configuration.md) 了解如何配置工具
- 查看 [使用指南](usage.md) 学习如何使用各个命令
- 查阅 [命令参考](commands.md) 了解所有可用的命令和选项

## 故障排除

### 编译错误：找不到头文件

**问题**：`fatal error: curl/curl.h: No such file or directory`

**解决**：安装 libcurl 开发包（见上文的必需依赖）

### 编译错误：链接错误

**问题**：`undefined reference to 'curl_easy_init'`

**解决**：确保链接了 libcurl 库，检查 pkg-config 是否能找到库：

```bash
pkg-config --libs libcurl
```

### 运行时错误：找不到共享库

**问题**：`error while loading shared libraries: libcurl.so.4`

**解决**：

- Ubuntu/Debian: `sudo apt-get install libcurl4`
- CentOS/RHEL: `sudo yum install libcurl`
- 或设置 `LD_LIBRARY_PATH` 包含库文件路径

### Termux 环境下编译

如果你在 Termux（Android）上编译：

```bash
pkg install clang libcurl json-c
clang manage.c -o manage -lcurl -ljson-c
```
