export interface TestTool {
  id: string;
  name: string;
  description: string;
  ip?: string;
  category: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
  author: string;
  testCases?: {
    id: string;
    name: string;
    description: string;
    status: string;
  }[];
  agent_version?: ""
}

// 项目接口
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'waiting' | 'running' | 'completed' | 'failed';
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
  testType?: string;
  agent_version?: {
    name: string;
    description?: string;
    id: number;
    created_at?: string;
    updated_at?: string;
  };
  test_cases?: Array<{
    id: number;
    name?: string;
    description?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export interface AgentVersion {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCaseExecution {
  id: string;
  name: string;
  caseName?: string;
  description?: string;
  type: string;
  status: 'waiting' | 'running' | 'success' | 'failed' | 'passed';
  progress: number;
  startTime?: string;
  endTime?: string;
  result?: string;
  logs?: string;
  duration?: number;
}

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

export interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  diskIO: number;
  networkIO: number;
}

export interface ExecutionHistory {
  id: string;
  toolId: string;
  toolName: string;
  startTime: string;
  endTime: string;
  status: string;
  timestamp: string;
  executor: string;
  progress: number;
} 