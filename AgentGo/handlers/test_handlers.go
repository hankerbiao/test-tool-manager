package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pyhanker/agentgo/models"
)

// TestRequest 测试运行请求
type TestRequest struct {
	Params map[string]interface{} `json:"params,omitempty"` // 可选参数
}

// TestResponse 测试运行响应
type TestResponse struct {
	ID       string      `json:"id"`
	Status   string      `json:"status"`
	Started  time.Time   `json:"started"`
	Finished time.Time   `json:"finished,omitempty"`
	Duration int64       `json:"duration_ms,omitempty"`
	Output   string      `json:"output,omitempty"`
	Error    string      `json:"error,omitempty"`
	Data     interface{} `json:"data,omitempty"`
}

// ListTests 列出所有可用的测试用例
func ListTests(c *gin.Context) {
	testCases := models.GetManager().ListTests()

	// 转换为可序列化的格式
	result := make([]gin.H, 0, len(testCases))
	for _, test := range testCases {
		result = append(result, gin.H{
			"id":          test.ID,
			"name":        test.Name,
			"description": test.Description,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"count": len(result),
		"tests": result,
	})
}

// RunTest 运行指定的测试用例
func RunTest(c *gin.Context) {
	testID := c.Param("test_id")

	var req TestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "无效的请求格式"})
		return
	}

	// 设置上下文，将参数传递给测试
	ctx := context.WithValue(c.Request.Context(), "params", req.Params)

	// 运行测试
	result, err := models.GetManager().RunTest(ctx, testID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// 转换结果
	response := TestResponse{
		ID:       result.TestID,
		Status:   string(result.Status),
		Started:  result.StartTime,
		Finished: result.EndTime,
		Duration: result.Duration,
		Output:   result.Output,
		Error:    result.Error,
		Data:     result.Data,
	}

	c.JSON(http.StatusOK, response)
}

// GetTestResult 获取测试结果
func GetTestResult(c *gin.Context) {
	testID := c.Param("test_id")

	// 获取测试结果
	result, exists := models.GetManager().GetTestResult(testID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "未找到测试结果"})
		return
	}

	// 转换结果
	response := TestResponse{
		ID:       result.TestID,
		Status:   string(result.Status),
		Started:  result.StartTime,
		Finished: result.EndTime,
		Duration: result.Duration,
		Output:   result.Output,
		Error:    result.Error,
		Data:     result.Data,
	}

	c.JSON(http.StatusOK, response)
}
