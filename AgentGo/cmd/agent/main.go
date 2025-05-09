package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pyhanker/agentgo/config"
	"github.com/pyhanker/agentgo/handlers"
	"github.com/pyhanker/agentgo/utils"
)

var (
	Version   = "1.0.0"
	BuildTime = "2025-04-12"
)

func main() {
	// 解析命令行参数
	port := flag.Int("port", 0, "指定HTTP服务端口 (默认: 65535)")
	logLevel := flag.String("log-level", "", "日志级别: debug, info, warn, error")
	logPath := flag.String("log-path", "", "日志文件路径 (默认: 标准输出)")
	showVersion := flag.Bool("version", false, "显示版本信息")
	configPath := flag.String("config", "", "配置文件路径")
	flag.Parse()

	// 显示版本信息
	if *showVersion {
		fmt.Printf("测试代理 v%s (构建时间: %s)\n", Version, BuildTime)
		os.Exit(0)
	}

	// 加载配置
	cfg := config.GetConfig()

	// 如果指定了配置文件，从文件加载
	if *configPath != "" {
		if err := config.LoadFromFile(*configPath); err != nil {
			fmt.Printf("无法加载配置文件 %s: %v\n", *configPath, err)
			os.Exit(1)
		}
	}

	// 命令行参数覆盖配置文件
	if *port != 0 {
		cfg.Port = *port
	}

	if *logLevel != "" {
		cfg.LogLevel = *logLevel
	}

	// 初始化日志系统
	if err := utils.InitLogger(cfg.LogLevel, *logPath); err != nil {
		fmt.Printf("初始化日志系统失败: %v\n", err)
		os.Exit(1)
	}
	defer utils.CloseLogger()

	// 生产模式下使用
	gin.SetMode(gin.ReleaseMode)

	// 创建路由引擎
	r := gin.New()

	// 使用自定义中间件
	r.Use(loggerMiddleware())
	r.Use(recoveryMiddleware())

	// 注册测试用例处理器
	handlers.RegisterHandlers(r)

	// 优雅关闭
	setupGracefulShutdown()

	// 运行HTTP服务
	addr := fmt.Sprintf(":%d", cfg.Port)
	utils.Info("测试代理程序已启动，在端口 %d 上监听 (操作系统: %s/%s)", cfg.Port, runtime.GOOS, runtime.GOARCH)
	utils.Info("版本: %s, 构建时间: %s", Version, BuildTime)

	if err := r.Run(addr); err != nil {
		utils.Error("启动服务失败: %v", err)
		log.Fatalf("启动服务失败: %v", err)
	}
}

// 日志中间件
func loggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 开始时间
		startTime := time.Now()

		// 处理请求
		c.Next()

		// 计算延迟
		duration := time.Since(startTime)

		// 日志
		utils.LogRequest(c.Request.Method, c.Request.URL.Path, c.ClientIP(), c.Writer.Status(), duration)
	}
}

// 恢复中间件
func recoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				// 获取堆栈信息
				buf := make([]byte, 2048)
				n := runtime.Stack(buf, false)
				stackInfo := string(buf[:n])

				utils.Error("服务崩溃: %v\n%s", err, stackInfo)

				c.AbortWithStatusJSON(500, gin.H{
					"error": "内部服务器错误",
				})
			}
		}()

		c.Next()
	}
}

// 设置优雅关闭
func setupGracefulShutdown() {
	go func() {
		// 监听中断信号
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt, syscall.SIGTERM)

		// 阻塞直到收到信号
		<-c

		// 关闭前的清理工作
		utils.Info("正在关闭服务...")
		utils.CloseLogger()

		// 强制退出（如果3秒内没有正常退出）
		time.Sleep(3 * time.Second)
		os.Exit(0)
	}()
}
