/**
 * 应用全局配置
 */
const appConfig = {
  // API基础URL
  apiBaseUrl: '/api',
  
  // 应用名称
  appName: '测试工具管理',
  
  // 应用版本
  appVersion: '1.0.0',
  
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  
  // 本地存储键名
  storageKeys: {
    userPreferences: 'test_tools_manager_preferences',
    authToken: 'test_tools_manager_auth_token',
  },
  
  // 工具状态配置
  toolStatuses: {
    active: {
      color: 'green',
      text: '活跃',
    },
    inactive: {
      color: 'orange',
      text: '未激活',
    },
    deprecated: {
      color: 'red',
      text: '已废弃',
    },
  },
  
  // 工具执行状态配置
  executionStatuses: {
    running: {
      color: 'blue',
      text: '执行中',
    },
    completed: {
      color: 'green',
      text: '已完成',
    },
    failed: {
      color: 'red',
      text: '失败',
    },
  },
  
  // 默认工具分类
  defaultCategories: [
    '自动化测试',
    '性能测试',
    '安全测试',
    '接口测试',
    '其他工具',
  ],
};

export default appConfig; 