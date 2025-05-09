package handlers

import (
	"bytes"
	"net/http"
	"os/exec"
	"time"

	"github.com/gin-gonic/gin"
)

// CommandRequest 命令执行请求结构
type CommandRequest struct {
	Command   string   `json:"command"`
	Args      []string `json:"args,omitempty"`
	Timeout   int      `json:"timeout,omitempty"` // 超时时间（秒）
	Directory string   `json:"directory,omitempty"`
}

// CommandResult 命令执行结果结构
type CommandResult struct {
	Success      bool   `json:"success"`
	ExitCode     int    `json:"exit_code"`
	Output       string `json:"output"`
	ErrorMessage string `json:"error,omitempty"`
	ExecutionTime int64 `json:"execution_time_ms"`
}

// ExecCommand 执行shell命令
func ExecCommand(c *gin.Context) {
	var req CommandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求格式"})
		return
	}
	
	// 命令不能为空
	if req.Command == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "命令不能为空"})
		return
	}
	
	// 设置默认超时
	timeout := 30
	if req.Timeout > 0 {
		timeout = req.Timeout
	}
	
	// 创建命令
	cmd := exec.Command(req.Command, req.Args...)
	
	// 设置工作目录（如果指定）
	if req.Directory != "" {
		cmd.Dir = req.Directory
	}
	
	// 用于捕获输出
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	
	// 记录执行时间
	startTime := time.Now()
	
	// 执行命令
	err := cmd.Start()
	if err != nil {
		c.JSON(http.StatusInternalServerError, CommandResult{
			Success:      false,
			ExitCode:     -1,
			ErrorMessage: err.Error(),
			Output:       "",
			ExecutionTime: 0,
		})
		return
	}
	
	// 创建超时计时器
	done := make(chan error, 1)
	go func() {
		done <- cmd.Wait()
	}()
	
	// 等待命令完成或超时
	var cmdErr error
	select {
	case cmdErr = <-done:
		// 命令正常退出
	case <-time.After(time.Duration(timeout) * time.Second):
		// 命令超时，强制结束
		if err := cmd.Process.Kill(); err != nil {
			c.JSON(http.StatusInternalServerError, CommandResult{
				Success:      false,
				ExitCode:     -1,
				ErrorMessage: "命令执行超时且无法终止",
				Output:       stdout.String() + "\n" + stderr.String(),
				ExecutionTime: time.Since(startTime).Milliseconds(),
			})
			return
		}
		c.JSON(http.StatusRequestTimeout, CommandResult{
			Success:      false,
			ExitCode:     -1,
			ErrorMessage: "命令执行超时",
			Output:       stdout.String() + "\n" + stderr.String(),
			ExecutionTime: time.Since(startTime).Milliseconds(),
		})
		return
	}
	
	// 获取执行时间
	executionTime := time.Since(startTime).Milliseconds()
	
	// 检查命令执行状态
	exitCode := 0
	if cmdErr != nil {
		if exitError, ok := cmdErr.(*exec.ExitError); ok {
			exitCode = exitError.ExitCode()
		} else {
			c.JSON(http.StatusInternalServerError, CommandResult{
				Success:      false,
				ExitCode:     -1,
				ErrorMessage: cmdErr.Error(),
				Output:       stdout.String() + "\n" + stderr.String(),
				ExecutionTime: executionTime,
			})
			return
		}
	}
	
	// 组合输出
	output := stdout.String()
	if stderr.Len() > 0 {
		if output != "" {
			output += "\n"
		}
		output += stderr.String()
	}
	
	// 返回执行结果
	c.JSON(http.StatusOK, CommandResult{
		Success:      exitCode == 0,
		ExitCode:     exitCode,
		Output:       output,
		ErrorMessage: "",
		ExecutionTime: executionTime,
	})
} 