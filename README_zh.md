# Skim MCP Server

> 🚀 生产就绪的 Model Context Protocol 服务器，用于 Skim 代码转换
>
> 基于 [@dean0x](https://github.com/dean0x) 的 [Skim](https://github.com/dean0x/skim) 项目开发

[![版本](https://img.shields.io/npm/v/skim-mcp-server?style=flat-square)](https://www.npmjs.com/package/skim-mcp-server)
[![下载量](https://img.shields.io/npm/dm/skim-mcp-server?style=flat-square)](https://www.npmjs.com/package/skim-mcp-server)
[![许可证](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org/)

[![GitHub Stars](https://img.shields.io/github/stars/luw2007/skim-mcp-server?style=flat-square)](https://github.com/luw2007/skim-mcp-server/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/luw2007/skim-mcp-server?style=flat-square)](https://github.com/luw2007/skim-mcp-server/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/luw2007/skim-mcp-server/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/luw2007/skim-mcp-server?style=flat-square)](https://github.com/luw2007/skim-mcp-server/commits)

智能地为 LLM 上下文窗口压缩代码，内置安全性、监控和生产级功能。

---

## 📑 目录

- [🤔 这是什么？](#-这是什么这能帮我做什么)
- [🌟 特性](#-特性)
- [📦 安装](#-安装)
- [🔧 配置](#-配置)
- [🚀 使用](#-使用)
- [🔒 安全特性](#-安全特性)
- [🧪 测试](#-测试)
- [📊 性能](#-性能)
- [📖 文档](#-文档)
- [🛠️ 开发](#️-开发)
- [🐳 Docker](#-docker)
- [❓ 常见问题](#-常见问题新手必看)
- [🆘 支持](#-支持)
- [🔄 更新日志](#-更新日志)
- [🔮 路线图](#-路线图)
- [🙏 致谢](#-致谢)

---

## 🤔 这是什么？这能帮我做什么？

**简单来说：**

如果你在使用 **Claude Code**（AI 编程助手），当分析大型代码项目时，可能会遇到"上下文太长"的限制。

**Skim MCP Server 的作用：**
- 📦 自动压缩代码，保留结构但减少 60-95% 的内容
- 🧠 让 Claude Code 能分析更大的项目
- ⚡ 提供更准确的代码建议和分析

**前置条件：**
- ✅ 你已经安装了 [Claude Code](https://claude.ai/code)
- ✅ 你的电脑已安装 Node.js 18.0.0 或更高版本

**不确定是否需要？** 如果你经常用 Claude Code 分析大型代码库，这个工具会很有帮助！

## 🌟 特性

- 🔒 **默认安全** - 路径验证、输入清理、速率限制
- 📊 **生产监控** - 结构化日志、健康检查、指标
- 🚀 **高性能** - 使用 spawn 快速执行，优化的缓冲
- 🛡️ **DoS 保护** - 请求限制、大小限制、超时处理
- 📝 **全面日志** - Winston 集成，可配置日志级别
- 🧪 **完整测试覆盖** - 包含单元和集成测试
- 📦 **零依赖** - 仅 MCP SDK 和 Winston（生产依赖）

## 📦 安装

### 前置要求

- Node.js >= 18.0.0
- npm、pnpm 或 yarn

### 选项 1: 全局安装（推荐）

```bash
# 安装 MCP 服务器和 Skim CLI
npm install -g skim-mcp-server

# 或单独安装 skim CLI
npm install -g rskim
```

### 选项 2: 项目安装

```bash
# 在你的项目目录中
npm install skim-mcp-server
```

### 选项 3: 从源码安装

```bash
git clone https://github.com/luw2007/skim-mcp-server.git
cd skim-mcp-server
npm install
npm run build
```

### 自动安装 Skim

如果未找到，服务器会自动安装 Skim CLI：

```bash
# 在 npm install 期间（postinstall 钩子）
npm install skim-mcp-server

# 或手动安装
npm run install-skim
```

### 验证安装

安装完成后，验证是否成功：

```bash
# 检查 skim-mcp-server 是否可用
skim-mcp-server --version

# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0
```

如果 `skim-mcp-server` 提示"命令未找到"：

```bash
# 查看全局安装的包
npm list -g skim-mcp-server

# 查看 npm 全局路径
npm config get prefix
```

可能需要将 npm 全局路径添加到系统 PATH 中。

## 🔧 配置

### Claude Code 设置

找到并编辑 Claude Code 配置文件（根据你的操作系统）：

**macOS / Linux：**
- `~/.claude/config.json`（推荐优先尝试）
- 或 `~/.config/claude-code/config.json`

**Windows：**
- `C:\Users\你的用户名\.claude\config.json`
- 或 `C:\Users\你的用户名\AppData\Roaming\claude-code\config.json`

**如果文件不存在，请创建它。**

添加以下配置：

```json
{
  "mcpServers": {
    "skim": {
      "command": "skim-mcp-server"
    }
  }
}
```

⚠️ **重要**：配置后必须完全退出并重启 Claude Code 才能生效。

### 环境变量

```bash
# 日志级别
export LOG_LEVEL=info  # debug、info、warn、error

# 允许的基准路径（逗号分隔）
export SKIM_ALLOWED_PATHS=/workspace,/home/user/projects

# 速率限制
export SKIM_MAX_REQUESTS_PER_MINUTE=10

# 输入大小限制
export SKIM_MAX_INPUT_SIZE=10485760  # 10MB，以字节为单位
```

### 验证配置是否成功

配置完成并重启 Claude Code 后，测试一下：

1. 打开 Claude Code
2. 在对话中输入：
   ```
   帮我分析一下这个项目的代码结构
   ```
3. 观察 Claude Code 是否自动使用了 `mcp__skim__skim_analyze` 工具

**成功标志：**
- 你会在对话中看到类似 "正在使用 skim 工具分析代码..." 的提示
- 或者在工具调用日志中看到 `skim_file` / `skim_analyze` 调用记录

**如果没有生效：**
- 检查配置文件 JSON 格式是否正确（可以用 [jsonlint.com](https://jsonlint.com/) 验证）
- 确认已完全退出并重启 Claude Code
- 查看 Claude Code 的日志文件是否有错误信息

## 🚀 使用

配置完成后，工具会自动在 Claude Code 中可用：

### 工具 1: `skim_transform` - 转换源代码

从字符串转换代码：

```javascript
// Claude Code 在分析代码时自动使用此工具
mcp__skim__skim_transform({
  source: 'function add(a, b) { return a + b; }',
  language: 'javascript',
  mode: 'structure',
  show_stats: true
})

// 返回：
// function add(a, b)  { /* ... */ }
//
// 📊 Token 减少统计：
// [skim] 24 tokens → 9 tokens (62.5% 减少)
```

### 工具 2: `skim_file` - 转换文件

转换文件或目录：

```javascript
mcp__skim__skim_file({
  path: '/workspace/src',
  mode: 'structure',
  show_stats: true
})

// 返回压缩后的代码和统计信息
```

### 工具 3: `skim_analyze` - 架构分析

分析代码架构：

```javascript
mcp__skim__skim_analyze({
  path: '/workspace/src',
  mode: 'structure'
})

// 返回：
// 1. 压缩后的代码
// 2. Token 统计
// 3. 分析框架来指导 Claude
```

### 实际使用示例

**场景 1：分析项目架构**
```
你：「帮我分析一下 src/ 目录的代码架构」

Claude Code：
→ 自动调用 mcp__skim__skim_analyze
→ 压缩代码（减少 65% token）
→ 快速分析架构并给出建议

结果：得到完整的架构分析报告
```

**场景 2：代码审查**
```
你：「审查一下 src/auth.ts 的代码质量」

Claude Code：
→ 自动调用 mcp__skim__skim_file
→ 提取函数签名和关键逻辑
→ 提供详细的代码审查建议

结果：发现潜在问题和改进建议
```

**场景 3：理解大型文件**
```
你：「这个 3000 行的文件都做了什么？」

Claude Code：
→ 自动调用 mcp__skim__skim_transform
→ 压缩到核心结构（减少 80% 内容）
→ 快速理解主要逻辑

结果：清晰的功能概述和流程说明
```

**重点：你不需要手动调用这些工具，Claude Code 会自动判断何时使用！**

## 🔒 安全特性

### 路径验证

✅ 仅允许绝对路径
✅ 防止路径遍历攻击（`../../../etc/passwd`）
✅ 带有验证的符号链接解析
✅ 可配置的允许基准路径

### 输入清理

✅ 最大输入大小（默认 10MB）
✅ 空字节检测
✅ 命令注入预防
✅ Shell 注入缓解（参数化命令）

### 速率限制

✅ 每分钟请求数限制
✅ 防止 DoS 攻击
✅ Retry-after 头部

## 🧪 测试

### 运行测试

```bash
# 安装依赖
npm install

# 运行所有测试
npm test

# 带覆盖率测试
npm run test:coverage

# 开发监听模式
npm run test:watch
```

### 测试覆盖

- ✅ Skim CLI 可用性
- ✅ 路径遍历预防
- ✅ 输入验证
- ✅ 超大输入检测
- ✅ 无效语言检测
- ✅ 空字节拒绝
- ✅ 畸形路径处理

## 📊 性能

### 基准测试

```bash
# 单个文件（300 行）
skim transform - 1.3ms

# 大文件（3000 行）
skim transform - 14.6ms

# 缓存（第二次运行）
skim transform - 5ms（快 48 倍）

# MCP 开销 < 2ms
```

### 资源限制

- 最大输入：每个请求 10MB
- 最大输出：50MB 缓冲区
- 超时：每个请求 30 秒
- 速率限制：每分钟 10 个请求

## 📖 文档

### 转换模式

| 模式 | 减少率 | 使用场景 | 示例输出 |
|------|--------|----------|----------|
| **structure** | 60-80% | 架构分析 | `function foo() { /* ... */ }` |
| **signatures** | 85-92% | API 文档 | `function foo(): void` |
| **types** | 90-95% | 类型系统分析 | `interface User { name: string }` |
| **full** | 0% | 调试/验证 | 原始代码 |

### 支持的语言

- TypeScript / JavaScript
- Python
- Rust
- Go
- Java
- JSON（特殊结构模式）
- Markdown（头部提取）

### CLI 参考

```bash
# 转换文件
skim file.ts --mode=structure --show-stats

# 转换目录
skim src/ --mode=signatures

# 使用 glob 转换
skim 'src/**/*.ts' --jobs 4

# 清除缓存
skim --clear-cache
```

## 🛠️ 开发

### 设置

```bash
git clone https://github.com/luw2007/skim-mcp-server.git
cd skim-mcp-server
npm install
```

### 开发工作流

```bash
# 开始开发
npm run dev

# 检查代码
npm run lint

# 修复检查问题
npm run lint:fix

# 格式化代码
npm run format:fix

# 构建生产版本
npm run build
```

### 项目结构

```
skim-mcp-server/
├── src/
│   └── index.js          # 主服务器
├── test/
│   └── index.test.js     # 测试套件
├── scripts/
│   ├── install-skim.js   # 自动安装脚本
│   └── build.js          # 构建脚本
├── docs/
│   └── examples.md       # 使用示例
├── dist/                 # 构建文件
└── README.md
```

## 🐳 Docker

### 构建镜像

```bash
docker build -t skim-mcp-server .
```

### 运行容器

```bash
docker run -i --rm \
  -e LOG_LEVEL=info \
  -v /workspace:/workspace \
  skim-mcp-server
```

### Docker Compose

```yaml
version: '3.8'
services:
  skim-mcp:
    image: skim-mcp-server
    environment:
      - LOG_LEVEL=info
      - SKIM_ALLOWED_PATHS=/workspace
    volumes:
      - ./workspace:/workspace
```

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

### 开发设置

1. Fork 仓库
2. 创建功能分支
3. 做出更改
4. 添加测试
5. 确保检查通过
6. 提交 pull request

## ❓ 常见问题（新手必看）

### 安装相关

**Q1: 提示 "skim-mcp-server: command not found"**

原因：npm 全局安装路径不在系统 PATH 中。

解决方法：
```bash
# 方法 1：查找安装路径
npm config get prefix

# 假设返回 /usr/local，则完整路径是：
# /usr/local/bin/skim-mcp-server

# 方法 2：在配置文件中使用完整路径
{
  "mcpServers": {
    "skim": {
      "command": "/usr/local/bin/skim-mcp-server"  # 替换为实际路径
    }
  }
}
```

**Q2: 提示 Node.js 版本不兼容**

检查版本：
```bash
node --version
```

必须 >= 18.0.0。如果版本过低，访问 [nodejs.org](https://nodejs.org/) 下载最新 LTS 版本。

---

### 配置相关

**Q3: 找不到配置文件在哪里**

按以下顺序尝试：

**macOS / Linux：**
```bash
# 1. 检查这个路径
ls -la ~/.claude/config.json

# 2. 如果不存在，检查这个
ls -la ~/.config/claude-code/config.json

# 3. 如果都不存在，创建第一个
mkdir -p ~/.claude
echo '{"mcpServers":{}}' > ~/.claude/config.json
```

**Windows：**
在文件资源管理器中搜索 `config.json`，或者直接创建：
```
C:\Users\你的用户名\.claude\config.json
```

**Q4: 配置后没有任何效果**

检查清单：
- [ ] 配置文件是合法的 JSON 格式（使用 [jsonlint.com](https://jsonlint.com/) 验证）
- [ ] 已完全退出 Claude Code（不是最小化，是完全退出）
- [ ] 重新启动 Claude Code
- [ ] `skim-mcp-server` 命令在终端中可以运行
- [ ] 检查 Claude Code 日志是否有错误信息

---

### 使用相关

**Q5: 工具什么时候会自动使用？**

Claude Code 在以下情况会自动使用 Skim：
- 分析大型代码文件或目录
- 代码审查任务
- 架构分析请求
- 需要理解代码结构时

你**不需要手动调用**，Claude Code 会自动判断何时使用。

**Q6: 如何知道 Skim 正在工作？**

观察 Claude Code 的对话窗口，如果看到：
- 工具调用提示：`mcp__skim__skim_file` 或 `mcp__skim__skim_analyze`
- Token 统计信息
- "正在压缩代码..." 类似的提示

说明 Skim 正在工作。

**Q7: Skim 会修改我的代码吗？**

**不会！** Skim 只是读取和压缩代码用于分析，**不会修改任何源文件**。

## 🆘 支持

### 报告问题

请在 [GitHub Issues](https://github.com/luw2007/skim-mcp-server/issues) 报告问题。

包含信息：
- Node.js 版本 (`node --version`)
- 操作系统和架构
- 重现步骤
- 错误日志

### 获取帮助

- 📖 文档: [docs/](docs/)
- 💡 示例: [docs/examples.md](docs/examples.md)
- 💬 讨论: [GitHub Discussions](https://github.com/luw2007/skim-mcp-server/discussions)

## 🔄 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本历史

## 🔮 路线图

### v1.1.0 (下一个版本)

- [ ] HTTP 传输支持
- [ ] WebSocket 传输
- [ ] 插件系统
- [ ] 自定义转换规则
- [ ] 集成更多 LLM 平台

### v1.2.0 (未来)

- [ ] 并行处理优化
- [ ] 内存高效流式处理
- [ ] 高级缓存策略
- [ ] 指标仪表板

## 🙏 致谢

### 特别感谢

**[Skim](https://github.com/dean0x/skim) 项目及其作者 [@dean0x](https://github.com/dean0x)**

本项目是基于 dean0x 创建的优秀 Skim 项目开发的 MCP 服务器包装。Skim 是一个强大的代码转换工具，使用 Rust 编写，为 LLM 提供智能代码压缩能力。

- **原始项目**: https://github.com/dean0x/skim
- **核心技术**: Rust + tree-sitter
- **贡献**: 提供了 60-95% 的代码压缩能力

没有 dean0x 的出色工作，这个 MCP 服务器就不会存在。强烈建议访问原始项目了解更多技术细节！

### 其他致谢

- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP 协议规范
- [tree-sitter](https://tree-sitter.github.io/) - 代码解析引擎
- [Claude Code](https://claude.ai/code) 团队 - 提供优秀的 AI 编程助手平台
- 所有为本项目做出贡献的开发者

---

**为 LLM 社区打造 ❤️**
