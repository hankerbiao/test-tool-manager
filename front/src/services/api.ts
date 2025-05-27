import {Project, TestCase, TestResult, PerformanceData, AgentVersion, ExecutionHistory} from '../types';

// 模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API基础URL
const BASE_URL = 'http://localhost:8000/api/v1';

// 通用请求函数
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    try {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
};


// 模拟测试用例列表
const mockTestCases: TestCase[] = [
    {id: '1', name: '读取性能测试', description: '测试磁盘读取速度', type: '性能'},
    {id: '2', name: '写入性能测试', description: '测试磁盘写入速度', type: '性能'},
    {id: '3', name: '随机读写测试', description: '测试磁盘随机读写性能', type: '性能'},
    {id: '4', name: '顺序读写测试', description: '测试磁盘顺序读写性能', type: '性能'},
    {id: '5', name: '磁盘IO压力测试', description: '测试高负载下的磁盘性能', type: '压力'},
    {id: '6', name: '长时间读写测试', description: '测试长时间读写的稳定性', type: '稳定性'},
    {id: '7', name: '断电恢复测试', description: '测试断电后数据恢复情况', type: '恢复'},
    {id: '8', name: '文件系统一致性测试', description: '测试文件系统一致性', type: '一致性'}
];

// 模拟测试结果
const mockTestResults: Record<string, TestResult[]> = {
    '1': [
        {
            id: '1',
            caseId: '1',
            caseName: '读取性能测试',
            status: 'passed',
            duration: 120,
            logs: '测试通过，读取速度: 500MB/s',
            startTime: '2024-04-10 15:35',
            endTime: '2024-04-10 15:37'
        },
        {
            id: '2',
            caseId: '2',
            caseName: '写入性能测试',
            status: 'passed',
            duration: 145,
            logs: '测试通过，写入速度: 350MB/s',
            startTime: '2024-04-10 15:38',
            endTime: '2024-04-10 15:40'
        },
        {
            id: '3',
            caseId: '3',
            caseName: '随机读写测试',
            status: 'passed',
            duration: 180,
            logs: '测试通过，IOPS: 12000',
            startTime: '2024-04-10 15:42',
            endTime: '2024-04-10 15:45'
        }
    ],
    '2': [
        {
            id: '4',
            caseId: '1',
            caseName: '读取性能测试',
            status: 'passed',
            duration: 118,
            logs: '测试通过，读取速度: 520MB/s',
            startTime: '2024-04-05 09:20',
            endTime: '2024-04-05 09:22'
        },
        {
            id: '5',
            caseId: '2',
            caseName: '写入性能测试',
            status: 'passed',
            duration: 140,
            logs: '测试通过，写入速度: 370MB/s',
            startTime: '2024-04-05 09:23',
            endTime: '2024-04-05 09:25'
        },
        {
            id: '6',
            caseId: '3',
            caseName: '随机读写测试',
            status: 'failed',
            duration: 95,
            logs: '测试失败，IOPS: 5000，低于阈值8000',
            startTime: '2024-04-05 09:27',
            endTime: '2024-04-05 09:28'
        }
    ]
};

// 模拟性能数据
const mockPerformanceData: Record<string, PerformanceData[]> = {
    '1': Array.from({length: 50}, (_, i) => ({
        timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
        cpu: 30 + Math.random() * 40,
        memory: 50 + Math.random() * 20,
        diskIO: 200 + Math.random() * 300,
        networkIO: 10 + Math.random() * 50
    })),
    '2': Array.from({length: 50}, (_, i) => ({
        timestamp: new Date(Date.now() - (50 - i) * 60000).toISOString(),
        cpu: 25 + Math.random() * 35,
        memory: 45 + Math.random() * 25,
        diskIO: 180 + Math.random() * 320,
        networkIO: 8 + Math.random() * 45
    }))
};

// 模拟代理版本
const mockAgentVersions: AgentVersion[] = [
    {id: '1', name: 'v1.0.0', description: '基础版本'},
    {id: '2', name: 'v1.1.0', description: '支持旧款机型'},
    {id: '3', name: 'v1.2.0', description: '支持新款机型'},
    {id: '4', name: 'v1.2.3', description: '最新稳定版'},
    {id: '5', name: 'v1.3.0-beta', description: '测试版'}
];

// API 函数
export const api = {
    // 获取工具列表
    getTools: async (skip: number = 0, limit: number = 100): Promise<any[]> => {
        try {
            // 使用request函数调用后端API
            const response = await request<{
                status: boolean;
                message: string;
                data: any[];
                total: number;
            }>(`/machines/?skip=${skip}&limit=${limit}`, {
                method: 'GET',
            });
            
            // 检查响应状态
            if (!response.status) {
                console.error('获取工具列表失败:', response.message);
                return [];
            }
            
            // 将后端返回数据转换为前端需要的格式
            return response.data.map(item => ({
                id: item.id.toString(),
                name: item.name,
                ip: item.ip || '',
                description: item.description || '',
                status: item.status || 'active',
                version: item.agent_version?.name || '',
                category: item.test_type || 'performance',
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                author: item.username || '系统',
                testCases: item.test_cases?.map((tc: any) => ({
                    id: tc.id.toString(),
                    name: tc.name || '',
                    description: tc.description || '',
                    status: 'active'
                })) || []
            }));
        } catch (error) {
            console.error('获取工具列表失败:', error);
            // 返回空数组，避免前端报错
            return [];
        }
    },

    // 创建新项目
    createProject: async (data: {
        name: string;
        description?: string;
        testType: string;
        machine: { username: string; password: string; ip: string };
        agentVersionId: string;
        testCaseIds: string[]
    }): Promise<Project> => {
        try {
            // 构建符合后端API的数据结构
            const requestData = {
                name: data.name,
                description: data.description || '',
                test_type: data.testType,
                agent_version_id: parseInt(data.agentVersionId),
                ip: data.machine.ip,
                username: data.machine.username,
                password: data.machine.password,
                test_case_ids: data.testCaseIds.map(id => parseInt(id))
            };
            console.log('请求数据:', requestData);
            // 调用真实接口
            const response = await request<Project>('/machines', {
                method: 'POST',
                body: JSON.stringify(requestData),
            });

            return response;
        } catch (error) {
            console.error('创建项目失败:', error);
            throw error;
        }
    },

    // 获取代理版本
    getAgentVersions: async (): Promise<AgentVersion[]> => {
        try {
            // 使用request函数调用后端API
            const response = await request<any[]>('/agent-versions/', {
                method: 'GET',
            });

            // 将后端返回数据转换为前端需要的格式
            return response.map(item => ({
                id: item.id.toString(), // 转换为字符串以匹配前端类型
                name: item.name,
                description: item.description || '', // 处理可能为null的描述
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));
        } catch (error) {
            console.error('获取代理版本失败:', error);
            // 如果接口请求失败，使用模拟数据作为备选
            return mockAgentVersions;
        }
    },

    // 获取测试用例
    getTestCases: async (): Promise<TestCase[]> => {
        try {
            // 使用request函数调用后端API
            const response = await request<any[]>('/test-cases/', {
                method: 'GET',
            });

            // 将后端返回数据转换为前端需要的格式
            return response.map(item => ({
                id: item.id.toString(), // 转换为字符串以匹配前端类型
                name: item.name,
                description: item.description || '', // 处理可能为null的描述
                type: item.test_type || '', // 处理类型字段
                status: item.status || 'active', // 默认状态为active
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));
        } catch (error) {
            console.error('获取测试用例失败:', error);
            // 如果接口请求失败，使用模拟数据作为备选
            return mockTestCases;
        }
    },

    // 获取测试结果
    getTestResults: async (projectId: string): Promise<TestResult[]> => {
        await delay(600);
        return mockTestResults[projectId] || [];
    },

    // 获取性能数据
    getPerformanceData: async (projectId: string): Promise<PerformanceData[]> => {
        await delay(700);
        return mockPerformanceData[projectId] || [];
    },

    // 校验机器连接
    validateMachine: async (data: { username: string; password: string; ip: string }): Promise<{ success: boolean; message: string }> => {
        try {
            // 这里改用validate-machine接口
            const response = await request<{ success: boolean; message: string }>('/machines/validate-machine', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            return response;
        } catch (error) {
            console.error('验证机器连接时出错:', error);
            return { success: false, message: '连接服务失败，请检查网络或服务状态' };
        }
    },

    // 获取执行历史记录
    getExecutionHistory: async (toolId?: string): Promise<ExecutionHistory[]> => {
        try {
            const endpoint = toolId 
                ? `/executions/?tool_id=${toolId}` 
                : '/executions/';
                
            const response = await request<any[]>(endpoint, {
                method: 'GET',
            });
            
            // 将后端返回数据转换为前端需要的格式
            return response.map(item => ({
                id: item.id.toString(),
                toolId: item.tool_id?.toString() || '',
                toolName: item.tool_name || '',
                startTime: item.start_time || '',
                endTime: item.end_time || '',
                status: item.status || 'pending',
                timestamp: item.start_time || '',
                executor: item.executor || '系统',
                progress: item.progress || 0
            }));
        } catch (error) {
            console.error('获取执行历史记录失败:', error);
            // 如果API请求失败，返回空数组
            return [];
        }
    },
    
    // 删除机器/工具
    deleteTool: async (toolId: string): Promise<boolean> => {
        try {
            // 调用后端删除接口
            await request<any>(`/machines/${toolId}`, {
                method: 'DELETE',
            });
            
            return true;
        } catch (error) {
            console.error('删除机器失败:', error);
            return false;
        }
    }
};