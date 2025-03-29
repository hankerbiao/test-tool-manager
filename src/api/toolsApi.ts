// import axios from 'axios';
import { TestTool, ToolExecutionResult } from '../types/tools';

// TODO 基础API URL，使用模拟数据，暂无实际功能
// const API_BASE_URL = '/api';

// 创建axios实例
// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// 获取所有工具
export const fetchTools = async (): Promise<TestTool[]> => {
  try {
    // TODO 真实环境中应该使用实际API，以下同理
    // const response = await apiClient.get('/tools');
    // return response.data;
    
    // 模拟数据
    return getMockTools();
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }
};

// 获取单个工具
export const fetchToolById = async (id: string): Promise<TestTool> => {
  try {
    // 真实环境中应该使用实际API
    // const response = await apiClient.get(`/tools/${id}`);
    // return response.data;
    
    // 模拟数据
    const tools = getMockTools();
    const tool = tools.find(t => t.id === id);
    if (!tool) {
      throw new Error(`Tool with ID ${id} not found`);
    }
    return tool;
  } catch (error) {
    console.error(`Error fetching tool ${id}:`, error);
    throw error;
  }
};

// 执行工具
export const executeTool = async (id: string, params: any): Promise<ToolExecutionResult> => {
  try {
    // 真实环境中应该使用实际API
    // const response = await apiClient.post(`/tools/${id}/execute`, params);
    // return response.data;
    
    // 模拟执行
    return {
      id: `exec-${Date.now()}`,
      toolId: id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      status: 'completed',
      output: `工具 ${id} 执行成功，参数：${JSON.stringify(params)}`,
    };
  } catch (error) {
    console.error(`Error executing tool ${id}:`, error);
    throw error;
  }
};

// 创建工具
export const createTool = async (tool: Omit<TestTool, 'id'>): Promise<TestTool> => {
  try {
    // 真实环境中应该使用实际API
    // const response = await apiClient.post('/tools', tool);
    // return response.data;
    
    // 模拟创建
    return {
      ...tool,
      id: `tool-${Date.now()}`,
    };
  } catch (error) {
    console.error('Error creating tool:', error);
    throw error;
  }
};

// 更新工具
export const updateTool = async (id: string, updates: Partial<TestTool>): Promise<TestTool> => {
  try {
    // 真实环境中应该使用实际API
    // const response = await apiClient.put(`/tools/${id}`, updates);
    // return response.data;
    
    // 模拟更新
    const tools = getMockTools();
    const toolIndex = tools.findIndex(t => t.id === id);
    if (toolIndex === -1) {
      throw new Error(`Tool with ID ${id} not found`);
    }
    
    const updatedTool = { ...tools[toolIndex], ...updates };
    return updatedTool;
  } catch (error) {
    console.error(`Error updating tool ${id}:`, error);
    throw error;
  }
};

// 删除工具
export const deleteTool = async (id: string): Promise<void> => {
  try {
    // 真实环境中应该使用实际API
    // await apiClient.delete(`/tools/${id}`);
    
    // 模拟删除
    console.log(`Mock deletion of tool ${id}`);
  } catch (error) {
    console.error(`Error deleting tool ${id}:`, error);
    throw error;
  }
};

// 模拟工具数据
function getMockTools(): TestTool[] {
  return [
    {
      id: 'tool-1',
      name: 'API自动化测试工具',
      description: '用于API接口的自动化测试，支持REST和GraphQL',
      version: '1.2.3',
      status: 'active',
      lastRun: '2023-08-10T08:45:12Z',
      path: '/usr/local/bin/apitest',
      command: 'apitest run --config {config}',
      parameters: [
        {
          name: 'config',
          type: 'string',
          required: true,
          description: '配置文件路径',
        },
        {
          name: 'environment',
          type: 'string',
          required: false,
          default: 'development',
          description: '环境名称',
        },
      ],
      category: '接口测试',
      tags: ['API', '自动化', 'REST', 'GraphQL'],
    },
    {
      id: 'tool-2',
      name: '性能监控工具',
      description: '监控应用性能指标，包括CPU、内存使用率和响应时间',
      version: '2.0.1',
      status: 'active',
      lastRun: '2023-08-12T14:20:30Z',
      command: 'perfmon -t {timeout} -h {host}',
      parameters: [
        {
          name: 'host',
          type: 'string',
          required: true,
          description: '目标主机地址',
        },
        {
          name: 'timeout',
          type: 'number',
          required: false,
          default: 60,
          description: '监控时长（秒）',
        },
      ],
      category: '性能测试',
      tags: ['监控', '性能', '指标'],
    },
    {
      id: 'tool-3',
      name: '安全扫描器',
      description: '扫描应用安全漏洞，包括SQL注入、XSS和CSRF等',
      version: '0.9.5',
      status: 'inactive',
      path: '/opt/security/scanner',
      command: 'security-scan --url {url} --depth {depth}',
      parameters: [
        {
          name: 'url',
          type: 'string',
          required: true,
          description: '目标URL',
        },
        {
          name: 'depth',
          type: 'number',
          required: false,
          default: 3,
          description: '扫描深度',
        },
        {
          name: 'report-format',
          type: 'string',
          required: false,
          default: 'html',
          description: '报告格式，支持html、pdf和json',
        },
      ],
      category: '安全测试',
      tags: ['安全', '漏洞', '扫描'],
    },
    {
      id: 'tool-4',
      name: 'UI自动化测试工具',
      description: '基于Selenium的UI自动化测试工具，支持多浏览器测试',
      version: '3.1.0',
      status: 'active',
      command: 'ui-test --browser {browser} --test-suite {testSuite}',
      parameters: [
        {
          name: 'browser',
          type: 'string',
          required: true,
          default: 'chrome',
          description: '浏览器类型，支持chrome、firefox和safari',
        },
        {
          name: 'testSuite',
          type: 'string',
          required: true,
          description: '测试套件路径',
        },
        {
          name: 'headless',
          type: 'boolean',
          required: false,
          default: false,
          description: '是否使用无头模式',
        },
      ],
      category: '自动化测试',
      tags: ['UI', '自动化', 'Selenium', '浏览器'],
    },
    {
      id: 'tool-5',
      name: '日志分析工具',
      description: '分析应用日志，提取错误和警告信息',
      version: '1.0.0',
      status: 'deprecated',
      command: 'log-analyzer --file {logFile} --pattern {pattern}',
      parameters: [
        {
          name: 'logFile',
          type: 'string',
          required: true,
          description: '日志文件路径',
        },
        {
          name: 'pattern',
          type: 'string',
          required: false,
          description: '搜索模式，支持正则表达式',
        },
      ],
      category: '其他工具',
      tags: ['日志', '分析', '调试'],
    },
  ];
} 