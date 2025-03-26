export interface TestTool {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  lastRun?: string;
  path?: string;
  command?: string;
  parameters?: ToolParameter[];
  category: string;
  tags?: string[];
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  description?: string;
}

export interface ToolExecutionResult {
  id: string;
  toolId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
} 