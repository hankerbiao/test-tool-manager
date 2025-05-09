package utils

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

// 日志级别
const (
	LogLevelDebug = "debug"
	LogLevelInfo  = "info"
	LogLevelWarn  = "warn"
	LogLevelError = "error"
)

var (
	debugLogger *log.Logger
	infoLogger  *log.Logger
	warnLogger  *log.Logger
	errorLogger *log.Logger
	logLevel    string
	logFile     *os.File
)

// InitLogger 初始化日志系统
func InitLogger(level string, logPath string) error {
	logLevel = level
	
	// 如果指定了日志路径，则写入文件
	var logWriter io.Writer = os.Stdout
	
	if logPath != "" {
		// 确保日志目录存在
		if err := os.MkdirAll(filepath.Dir(logPath), 0755); err != nil {
			return fmt.Errorf("无法创建日志目录: %v", err)
		}
		
		// 打开或创建日志文件
		var err error
		logFile, err = os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return fmt.Errorf("无法打开日志文件: %v", err)
		}
		
		// 使用多输出目标（终端和文件）
		logWriter = io.MultiWriter(os.Stdout, logFile)
	}
	
	// 创建不同级别的日志记录器
	debugLogger = log.New(logWriter, "[DEBUG] ", log.Ldate|log.Ltime)
	infoLogger = log.New(logWriter, "[INFO] ", log.Ldate|log.Ltime)
	warnLogger = log.New(logWriter, "[WARN] ", log.Ldate|log.Ltime)
	errorLogger = log.New(logWriter, "[ERROR] ", log.Ldate|log.Ltime)
	
	return nil
}

// CloseLogger 关闭日志
func CloseLogger() {
	if logFile != nil {
		logFile.Close()
	}
}

// 获取调用者信息
func getCallerInfo() string {
	_, file, line, ok := runtime.Caller(2)
	if !ok {
		return ""
	}
	
	// 仅使用短文件名
	return fmt.Sprintf("%s:%d", filepath.Base(file), line)
}

// Debug 记录调试级别日志
func Debug(format string, args ...interface{}) {
	if logLevel == LogLevelDebug {
		msg := fmt.Sprintf(format, args...)
		caller := getCallerInfo()
		debugLogger.Printf("%s %s", msg, caller)
	}
}

// Info 记录信息级别日志
func Info(format string, args ...interface{}) {
	if logLevel == LogLevelDebug || logLevel == LogLevelInfo {
		msg := fmt.Sprintf(format, args...)
		infoLogger.Println(msg)
	}
}

// Warn 记录警告级别日志
func Warn(format string, args ...interface{}) {
	if logLevel != LogLevelError {
		msg := fmt.Sprintf(format, args...)
		caller := getCallerInfo()
		warnLogger.Printf("%s %s", msg, caller)
	}
}

// Error 记录错误级别日志
func Error(format string, args ...interface{}) {
	msg := fmt.Sprintf(format, args...)
	caller := getCallerInfo()
	errorLogger.Printf("%s %s", msg, caller)
}

// LogRequest 记录HTTP请求信息
func LogRequest(method, path, clientIP string, statusCode int, duration time.Duration) {
	Info("%s %s %s %d %s", method, path, clientIP, statusCode, duration)
} 