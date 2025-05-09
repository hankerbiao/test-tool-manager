package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// Config 代理程序配置结构
type Config struct {
	Port        int    `json:"port"`
	LogLevel    string `json:"log_level"`
	TestTimeout int    `json:"test_timeout"` // 默认测试超时时间（秒）
	WorkDir     string `json:"work_dir"`
}

var (
	cfg  *Config
	once sync.Once
)

// GetConfig 获取配置单例
func GetConfig() *Config {
	once.Do(func() {
		cfg = &Config{
			Port:        65535,
			LogLevel:    "info",
			TestTimeout: 60,
			WorkDir:     os.TempDir(),
		}
		
		// 尝试从文件加载配置
		loadConfig()
	})
	
	return cfg
}

// LoadFromFile 从指定文件加载配置
func LoadFromFile(path string) error {
	return loadFromFile(path)
}

// 尝试从配置文件加载
func loadConfig() {
	// 尝试多个可能的配置文件位置
	configPaths := []string{
		"./config.json",
		"../config.json",
		"/etc/agentgo/config.json",
		filepath.Join(os.Getenv("HOME"), ".agentgo", "config.json"),
	}
	
	for _, path := range configPaths {
		if err := loadFromFile(path); err == nil {
			fmt.Printf("从配置文件加载成功: %s\n", path)
			return
		}
	}
	
	fmt.Println("未找到配置文件，使用默认配置")
}

// 从文件加载配置
func loadFromFile(path string) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	
	return json.Unmarshal(data, cfg)
}

// SaveConfig 保存配置到文件
func SaveConfig(path string) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	
	// 确保目录存在
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	
	return os.WriteFile(path, data, 0644)
} 