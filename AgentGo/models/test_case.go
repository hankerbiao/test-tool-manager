package models

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// TestStatus 表示测试用例的状态
type TestStatus string

const (
	StatusPending   TestStatus = "pending"
	StatusRunning   TestStatus = "running"
	StatusCompleted TestStatus = "completed"
	StatusFailed    TestStatus = "failed"
	StatusCancelled TestStatus = "cancelled"
)

// TestCase 表示一个测试用例
type TestCase struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Execute     TestRunFunc `json:"-"`
}

// TestResult 表示测试用例的执行结果
type TestResult struct {
	TestID      string      `json:"test_id"`
	Status      TestStatus  `json:"status"`
	StartTime   time.Time   `json:"start_time"`
	EndTime     time.Time   `json:"end_time"`
	Duration    int64       `json:"duration_ms"`
	Output      string      `json:"output"`
	Error       string      `json:"error,omitempty"`
	Data        interface{} `json:"data,omitempty"`
}

// TestRunFunc 定义测试用例执行函数的类型
type TestRunFunc func(ctx context.Context) *TestResult

// TestManager 管理测试用例和结果
type TestManager struct {
	testCases map[string]*TestCase
	results   map[string]*TestResult
	mu        sync.RWMutex
}

// 全局测试用例管理器实例
var testManager = NewTestManager()

// NewTestManager 创建新的测试管理器
func NewTestManager() *TestManager {
	return &TestManager{
		testCases: make(map[string]*TestCase),
		results:   make(map[string]*TestResult),
	}
}

// RegisterTest 注册一个新的测试用例
func (tm *TestManager) RegisterTest(testCase *TestCase) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	
	if _, exists := tm.testCases[testCase.ID]; exists {
		return fmt.Errorf("测试用例ID %s 已存在", testCase.ID)
	}
	
	tm.testCases[testCase.ID] = testCase
	return nil
}

// GetTest 获取指定ID的测试用例
func (tm *TestManager) GetTest(id string) (*TestCase, bool) {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	
	test, exists := tm.testCases[id]
	return test, exists
}

// ListTests 列出所有测试用例
func (tm *TestManager) ListTests() []*TestCase {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	
	tests := make([]*TestCase, 0, len(tm.testCases))
	for _, test := range tm.testCases {
		tests = append(tests, test)
	}
	
	return tests
}

// RunTest 运行指定的测试用例
func (tm *TestManager) RunTest(ctx context.Context, id string) (*TestResult, error) {
	tm.mu.RLock()
	test, exists := tm.testCases[id]
	tm.mu.RUnlock()
	
	if !exists {
		return nil, fmt.Errorf("未找到ID为 %s 的测试用例", id)
	}
	
	// 创建上下文，支持取消操作
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	
	// 执行测试
	result := test.Execute(ctx)
	
	// 保存结果
	tm.mu.Lock()
	tm.results[id] = result
	tm.mu.Unlock()
	
	return result, nil
}

// GetTestResult 获取指定测试的结果
func (tm *TestManager) GetTestResult(id string) (*TestResult, bool) {
	tm.mu.RLock()
	defer tm.mu.RUnlock()
	
	result, exists := tm.results[id]
	return result, exists
}

// GetManager 返回全局测试管理器实例
func GetManager() *TestManager {
	return testManager
} 