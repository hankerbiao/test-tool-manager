package models

import (
	"context"
	"fmt"
	"time"
)

func init() {
	// 注册硬盘信息测试
	registerDiskTests()
}

// 注册硬盘信息测试
func registerDiskTests() {
	// 硬盘信息收集测试
	err := GetManager().RegisterTest(&TestCase{
		ID:          "disk-info",
		Name:        "硬盘信息测试",
		Description: "收集系统硬盘的基本信息",
		Execute: func(ctx context.Context) *TestResult {
			startTime := time.Now()
			result := &TestResult{
				TestID:    "disk-info",
				Status:    StatusRunning,
				StartTime: startTime,
			}

			// 模拟处理时间
			time.Sleep(100 * time.Millisecond)
			endTime := time.Now()

			// 处理结果
			result.EndTime = endTime
			result.Duration = endTime.Sub(startTime).Milliseconds()
			result.Status = StatusCompleted

			// 使用假数据
			fakeDiskInfo := map[string]interface{}{
				"count": 3,
				"disks": []map[string]interface{}{
					{
						"name":         "/dev/sda1",
						"size":         "512.0 GB",
						"model":        "Samsung SSD 970 EVO",
						"type":         "SSD",
						"filesystem":   "ext4",
						"mountpoint":   "/",
						"used_space":   "98.5 GB",
						"free_space":   "413.5 GB",
						"used_percent": "19.2%",
					},
					{
						"name":         "/dev/sdb1",
						"size":         "1.0 TB",
						"model":        "WD Blue HDD",
						"type":         "HDD",
						"filesystem":   "ext4",
						"mountpoint":   "/data",
						"used_space":   "350.5 GB",
						"free_space":   "649.5 GB",
						"used_percent": "35.1%",
					},
					{
						"name":         "C:",
						"size":         "256.0 GB",
						"model":        "KINGSTON SA400S37",
						"type":         "Fixed",
						"filesystem":   "NTFS",
						"mountpoint":   "C:",
						"used_space":   "120.0 GB",
						"free_space":   "136.0 GB",
						"used_percent": "46.9%",
					},
				},
			}

			// 设置输出和数据
			result.Output = "硬盘信息模拟数据 - 硬盘总数: 3\n" +
				"1. Samsung SSD 970 EVO (512GB)\n" +
				"2. WD Blue HDD (1TB)\n" +
				"3. KINGSTON SA400S37 (256GB)"
			result.Data = fakeDiskInfo

			return result
		},
	})

	if err != nil {
		fmt.Printf("注册硬盘信息测试用例失败: %v\n", err)
	}
}
