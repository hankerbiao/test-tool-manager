package handlers

import (
	"net/http"
	"runtime"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

// HealthCheck 响应健康检查请求
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "ok",
		"timestamp": time.Now().Unix(),
		"version":   "1.0.0",
	})
}

// SystemInfo 获取系统信息
func SystemInfo(c *gin.Context) {
	// 主机信息
	hostInfo, _ := host.Info()
	
	// CPU信息
	cpuInfo, _ := cpu.Info()
	cpuCount := runtime.NumCPU()
	
	// 内存信息
	memInfo, _ := mem.VirtualMemory()
	
	// 磁盘信息
	diskInfo, _ := disk.Usage("/")
	
	c.JSON(http.StatusOK, gin.H{
		"hostname":     hostInfo.Hostname,
		"os":           hostInfo.OS,
		"platform":     hostInfo.Platform,
		"cpu_count":    cpuCount,
		"cpu_model":    cpuInfo[0].ModelName,
		"memory_total": memInfo.Total,
		"memory_free":  memInfo.Free,
		"disk_total":   diskInfo.Total,
		"disk_free":    diskInfo.Free,
		"uptime":       hostInfo.Uptime,
	})
} 