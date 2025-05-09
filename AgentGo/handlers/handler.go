package handlers

import (
	"github.com/gin-gonic/gin"
)

// RegisterHandlers 注册所有HTTP路由处理器
func RegisterHandlers(r *gin.Engine) {
	// 健康检查
	r.GET("/health", HealthCheck)

	// API版本v1
	v1 := r.Group("/api/v1")
	{
		// 系统信息
		v1.GET("/system/info", SystemInfo)

		// 执行命令
		v1.POST("/cmd/exec", ExecCommand)

		// 测试用例
		tests := v1.Group("/tests")
		{
			// 列出所有可用测试用例
			tests.GET("/list", ListTests)

			// 运行特定测试用例
			tests.POST("/run/:test_id", RunTest)

			// 获取测试用例执行结果
			tests.GET("/results/:test_id", GetTestResult)
		}
	}
}
