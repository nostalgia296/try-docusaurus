---
sidebar_position: 1
---

# GitHub Release Manager 简介

GitHub Release Manager 是一个命令行工具，用于管理 GitHub Release 中的资产文件（assets）。它可以帮助你上传、删除、更新和列出 Release 中的文件，支持批量操作和通配符匹配。

## 主要特性

- **文件管理**: 上传、删除、更新 GitHub Release 中的文件
- **批量操作**: 支持同时操作多个文件，使用通配符匹配文件模式
- **创建 Release**: 创建新的 GitHub Release 并上传文件
- **配置灵活**: 支持环境变量、配置文件和命令行参数
- **重试机制**: 自动重试失败的请求，提高可靠性
- **安全可靠**: 安全的 token 存储和文件路径验证

## 典型用途

- 自动化备份文件到 GitHub Release
- 管理软件发布包
- 批量更新 Release 中的文件
- CI/CD 集成

## 快速开始

```bash
# 设置 GitHub Token
export GITHUB_TOKEN=your_token_here

# 列出 Release 中的文件
./manage list

# 上传文件
./manage upload myfile.zip

# 删除文件
./manage delete oldfile.zip

# 更新文件
./manage update myfile.zip
```

接下来，你可以查看 [安装](installation.md) 章节了解如何安装和编译该工具。
