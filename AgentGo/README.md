# AgentGo 测试代理程序

AgentGo 是一个轻量级的测试代理程序，用于在测试环境中执行各种测试命令。它提供了一个 HTTP 服务器，允许远程控制和执行测试用例。

## 功能特点

- 轻量级设计，易于部署到各种测试环境
- 提供 HTTP API 接口，方便集成到自动化测试系统
- 支持多种测试用例，如网络连通性测试、系统负载测试、文件 I/O 测试等
- 可扩展的测试用例框架，方便添加新的测试类型
- 跨平台支持（Windows、Linux、macOS）

## 安装

### 从源码构建

需要 Go 1.18 或更高版本：

```bash
# 克隆代码库
git clone https://github.com/yourusername/agentgo.git
cd agentgo

# 构建
go build -o agentgo cmd/agent/main.go
```

### 下载预编译二进制文件

请访问 [GitHub Release 页面](https://github.com/yourusername/agentgo/releases) 下载适合您平台的二进制文件。

## 使用方法

### 启动服务

```bash
# 使用默认配置启动（端口 65535）
./agentgo

# 指定端口
./agentgo -port 8080

# 指定日志级别和日志文件
./agentgo -log-level debug -log-path /var/log/agentgo.log

# 使用配置文件
./agentgo -config /path/to/config.json
```

### 配置文件

配置文件示例 (JSON 格式):

```json
{
  "port": 65535,
  "log_level": "info",
  "test_timeout": 60,
  "work_dir": "/tmp"
}
```

## API 接口

### 健康检查

```
GET /health
```

返回代理程序的健康状态。

### 系统信息

```
GET /api/v1/system/info
```

返回测试代理运行环境的系统信息。

### 执行命令

```
POST /api/v1/cmd/exec
```

请求体:
```json
{
  "command": "ls",
  "args": ["-la"],
  "timeout": 30,
  "directory": "/tmp"
}
```

### 测试用例

#### 列出所有测试用例

```
GET /api/v1/tests/list
```

#### 运行测试用例

```
POST /api/v1/tests/run/:test_id
```

请求体:
```json
{
  "params": {
    "host": "8.8.8.8",
    "count": 5
  }
}
```

#### 获取测试结果

```
GET /api/v1/tests/results/:test_id
```

## 可用测试用例

| ID | 名称 | 描述 | 参数 |
|----|------|------|------|
| net-ping | 网络连接测试 | 测试与指定主机的网络连通性 | host, count |
| net-port | TCP端口测试 | 测试指定主机的TCP端口是否可达 | host, port, timeout |
| sys-load | 系统负载测试 | 获取系统当前负载情况 | 无 |
| file-rw | 文件读写测试 | 测试文件系统的读写性能 | size, path |

## 添加新测试用例

AgentGo 设计了一个简单的测试用例框架，可以轻松添加新的测试用例。在 `models/test_impl.go` 文件中按照现有模式添加新的测试用例函数。

## 许可证

MIT

## 作者

您的名字 <您的邮箱> 


AgentGo/
├── cmd/
│   └── agent/
│       └── main.go         # 程序入口
├── config/
│   └── config.go           # 配置管理
├── handlers/
│   ├── handler.go          # 处理器注册
│   ├── basic_handlers.go   # 基本请求处理
│   ├── command_handlers.go # 命令执行处理
│   └── test_handlers.go    # 测试用例处理
├── models/
│   ├── test_case.go        # 测试用例模型
│   └── test_impl.go        # 测试用例实现
├── utils/
│   └── logger.go           # 日志工具
├── go.mod                  # 依赖管理
├── go.sum                  # 依赖校验
└── README.md               # 说明文档



Add to Chat⌘L
⌘K to generate a command
创建一个轻量级的代理程序用于部署到测试机器上采集收据

使用go语言实现
启动一个http服务器，默认端口65535
功能：接受服务端的指令，执行一些测试命令

请设计代码架构，如果有必要，可以使用优秀的第三方库


不同的接口执行不同的测试用例
基于这种场景作为设计模式
方便后续添加修改测试用例

我将创建一个轻量级的代理程序，用于执行测试命令。先了解项目结构。
看起来这是一个全新的项目。我将创建一个简单但可扩展的代理程序架构。首先创建项目基本结构：
现在，我们创建项目的主要文件：
接下来，创建main.go文件：
创建处理器和测试用例管理器：
现在创建基本处理器：
创建命令执行处理器：
现在创建测试用例管理模块：
创建测试用例处理器：
创建示例测试用例：
Error calling tool 'edit_file'.
让我们创建一个示例测试用例实现：
最后，创建配置和工具模块：
最后，更新main.go文件以使用日志和配置：
最后，添加一个README文件：
让我们确保可以进行构建：
go mod tidy
已完成代理程序的设计和实现。现在我们来总结一下：
这是我们创建的代理程序架构，下面是项目整体结构和功能说明：
项目目录结构：
Apply to README.md
主要特点：
模块化设计：分离了核心功能到不同模块，便于维护和扩展。
可扩展的测试框架：
基于接口实现的测试用例系统
可以轻松添加新的测试用例
测试用例可接收参数，灵活配置执行环境
HTTP API：
/health - 健康检查
/api/v1/system/info - 系统信息
/api/v1/cmd/exec - 命令执行
/api/v1/tests/list - 列出测试用例
/api/v1/tests/run/:test_id - 执行测试
/api/v1/tests/results/:test_id - 获取结果
预置测试用例：
网络连接测试 (net-ping)
TCP端口测试 (net-port)
系统负载测试 (sys-load)
文件读写性能测试 (file-rw)
跨平台支持：
针对Windows和Unix系统提供不同实现
使用标准库和跨平台库确保兼容性
日志和配置：
支持不同日志级别
配置文件和命令行参数支持


go build -o agentgo cmd/agent/main.go