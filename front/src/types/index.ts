// 项目信息类型
export interface Project {
  id: string;
  name: string;
  description?: string; // 项目描述
  status: 'running' | 'completed' | 'failed' | 'waiting';
  progress: number;
  createTime: string;
  machine: {
    username: string;
    ip: string;
  };
  agentVersion: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  testType?: string; // 测试类型：性能测试、压力测试、诊断工具
}

// 测试用例类型
export interface TestCase {
  id: string;
  name: string;
  description?: string;
  type: string;
}

// 测试结果类型
export interface TestResult {
  id: string;
  caseId: string;
  caseName: string;
  status: 'passed' | 'failed';
  duration: number;
  logs: string;
  startTime: string;
  endTime: string;
}

// 性能数据类型
export interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  diskIO: number;
  networkIO: number;
}

// 代理版本类型
export interface AgentVersion {
  id: string;
  name: string;
  description: string;
}

// 测试工具类型
export interface TestTool {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'deprecated';
  version: string;
  category: string;
  path?: string;
  lastRun?: string;
}

// 测试用例执行记录类型
export interface TestCaseExecution {
  id: string;
  name?: string;
  caseName: string;
  description?: string;
  type: string;
  status: 'passed' | 'failed' | 'running' | 'waiting' | 'success';
  progress: number;
  duration?: number;
  startTime?: string;
  endTime?: string;
  logs?: string;
  result?: string;
}

// 测试历史记录类型
export interface ExecutionHistory {
  id: string;
  toolId: string;
  toolName: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'failed' | 'aborted' | 'pending';
  timestamp: string;
  executor: string;
  progress: number;
}

// 图表性能数据类型
export interface ChartPerformanceData {
  date: string;
  value: number;
  type: string;
} 