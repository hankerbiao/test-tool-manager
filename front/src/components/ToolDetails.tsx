import React, { useState, useEffect } from 'react';
import { Card, Tabs, Empty, Space, Button, Typography, Progress, message, Spin, Modal, Descriptions, Tag } from 'antd';
import { PlayCircleOutlined, EditOutlined, DeleteOutlined, FileTextOutlined, LineChartOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, LoadingOutlined, EyeOutlined, BarChartOutlined, InfoCircleOutlined, TagOutlined, UserOutlined, CalendarOutlined, DesktopOutlined } from '@ant-design/icons';
import { TestTool, TestCase, TestCaseExecution } from '../types';
import { api } from '../services/api';
import TestCaseTable from './TestCaseTable';
import { getStatusColor, getStatusText, getCategoryText } from '../utils/toolUtils';
import ExecutionLogModal from './ExecutionLogModal';
import PerformanceTestPage from './PerformanceTestPage';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 测试用例执行记录类型不再需要在这里定义，直接从types中导入

// 模拟API服务
const mockApiService = {
  // 启动测试执行
  startExecution: async (caseId: string): Promise<{ success: boolean, executionId: string }> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      executionId: `exec-${caseId}-${Date.now()}`
    };
  },
  
  // 获取执行状态
  getExecutionStatus: async (caseId: string): Promise<TestCaseExecution> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 根据caseId获取存储在sessionStorage中的执行状态
    const storedData = sessionStorage.getItem(`execution-${caseId}`);
    if (!storedData) {
      return {
        id: caseId,
        name: `测试用例 #${caseId}`,
        type: '未知类型',
        status: 'waiting',
        progress: 0
      };
    }
    
    return JSON.parse(storedData) as TestCaseExecution;
  },
  
  // 获取执行日志
  getExecutionLogs: async (caseId: string): Promise<string> => {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 根据caseId获取存储在sessionStorage中的日志
    const storedData = sessionStorage.getItem(`execution-logs-${caseId}`);
    if (!storedData) {
      return '[INFO] 暂无执行日志';
    }
    
    return storedData;
  },
  
  // 模拟后端的执行进度更新
  simulateBackendExecution: (caseId: string, onComplete?: () => void) => {
    let progress = 0;
    let status: 'running' | 'success' | 'failed' = 'running';
    
    // 初始状态
    const initialExecution: TestCaseExecution = {
      id: caseId,
      name: `测试用例 #${caseId}`,
      type: '性能测试',
      status: 'running',
      progress: 0,
      startTime: new Date().toLocaleString()
    };
    
    // 存储初始状态
    sessionStorage.setItem(`execution-${caseId}`, JSON.stringify(initialExecution));
    
    // 初始日志
    const baseLog = `[INFO] 开始执行测试用例 #${caseId}\n` +
      `[INFO] 初始化测试环境...\n` +
      `[INFO] 检查磁盘状态...\n`;
    sessionStorage.setItem(`execution-logs-${caseId}`, baseLog);
    
    // 模拟后端定期更新
    const interval = setInterval(() => {
      progress += 10;
      
      // 添加新的日志
      let currentLog = sessionStorage.getItem(`execution-logs-${caseId}`) || '';
      if (progress <= 100) {
        currentLog += `[INFO] 测试进行中: ${progress}%\n`;
        
        // 有10%概率添加警告信息
        if (Math.random() < 0.1) {
          currentLog += `[WARNING] 某些指标接近阈值\n`;
        }
      }
      
      // 完成时添加结果日志
      if (progress >= 100) {
        clearInterval(interval);
        
        // 70%概率成功，30%概率失败
        const isSuccess = Math.random() > 0.3;
        status = isSuccess ? 'success' : 'failed';
        
        if (isSuccess) {
          currentLog += `[INFO] 测试完成\n` +
            `[INFO] 结果: 通过\n` +
            `[INFO] 读取速度: ${Math.floor(Math.random() * 100) + 200} MB/s\n` +
            `[INFO] 写入速度: ${Math.floor(Math.random() * 100) + 150} MB/s\n` +
            `[INFO] IOPS: ${Math.floor(Math.random() * 5000) + 10000}\n` +
            `[INFO] 延迟: ${(Math.random() * 5).toFixed(1)}ms\n` +
            `[SUCCESS] 所有指标均达到预期要求`;
        } else {
          currentLog += `[INFO] 测试完成\n` +
            `[INFO] 结果: 失败\n` +
            `[INFO] 读取速度: ${Math.floor(Math.random() * 100) + 150} MB/s (正常)\n` +
            `[WARNING] 写入速度: ${Math.floor(Math.random() * 50) + 20} MB/s (低于预期 150 MB/s)\n` +
            `[WARNING] IOPS: ${Math.floor(Math.random() * 3000) + 2000} (低于预期 10000)\n` +
            `[ERROR] 延迟: ${Math.floor(Math.random() * 20) + 15}ms (超过预期 5ms)\n` +
            `[FAILED] 性能未达到预期要求`;
        }
        
        // 存储最终日志
        sessionStorage.setItem(`execution-logs-${caseId}`, currentLog);
        
        // 最终执行结果
        const finalExecution: TestCaseExecution = {
          id: caseId,
          name: `测试用例 #${caseId}`,
          type: '性能测试',
          status: status,
          progress: 100,
          startTime: initialExecution.startTime,
          endTime: new Date().toLocaleString(),
          result: isSuccess ? '测试通过，所有指标正常' : '测试失败，性能指标未达标'
        };
        
        // 存储最终状态
        sessionStorage.setItem(`execution-${caseId}`, JSON.stringify(finalExecution));
        
        // 确保异步更新完成后再调用onComplete
        setTimeout(() => {
          // 确保状态再次被写入以防止竞态条件
          sessionStorage.setItem(`execution-${caseId}`, JSON.stringify({
            ...finalExecution,
            progress: 100 // 再次确认进度为100%
          }));
          
          // 调用完成回调
          if (onComplete) {
            onComplete();
          }
        }, 300);
      } else {
        // 更新进度中的状态
        const updatedExecution: TestCaseExecution = {
          id: caseId,
          name: `测试用例 #${caseId}`,
          type: '性能测试',
          status: 'running',
          progress: progress,
          startTime: initialExecution.startTime
        };
        
        // 存储更新的状态
        sessionStorage.setItem(`execution-${caseId}`, JSON.stringify(updatedExecution));
        
        // 存储更新的日志
        sessionStorage.setItem(`execution-logs-${caseId}`, currentLog);
      }
    }, 500);
    
    // 返回清理函数
    return () => {
      clearInterval(interval);
    };
  }
};

interface ToolDetailsProps {
  tool: TestTool;
  onExecute: (toolId: number) => void;
  onEdit: (tool: TestTool) => void;
  onDelete: (tool: TestTool) => void;
  children?: React.ReactNode;
}

const ToolDetails: React.FC<ToolDetailsProps> = ({
  tool,
  onExecute,
  onEdit,
  onDelete,
  children
}) => {
  // 测试用例状态
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testCaseExecutions, setTestCaseExecutions] = useState<TestCaseExecution[]>([]);
  const [executingCaseId, setExecutingCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 日志查看状态
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<TestCaseExecution | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string>('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 加载测试用例数据
  useEffect(() => {
    loadTestCases();
    
    // 组件卸载时清除sessionStorage中的执行数据
    return () => {
      // 清除测试用例相关的sessionStorage数据
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('execution-') || key.startsWith('execution-logs-'))) {
          sessionStorage.removeItem(key);
        }
      }
    };
  }, [tool]);

  // 监听执行中的测试用例状态
  useEffect(() => {
    if (executingCaseId) {
      const pollInterval = setInterval(async () => {
        try {
          // 从后端获取最新状态
          const latestStatus = await mockApiService.getExecutionStatus(executingCaseId);
          
          // 更新执行状态
          setTestCaseExecutions(prevExecutions => {
            const index = prevExecutions.findIndex(e => e.id === executingCaseId);
            if (index === -1) return prevExecutions;
            
            const newExecutions = [...prevExecutions];
            newExecutions[index] = {
              ...newExecutions[index],
              ...latestStatus
            };
            
            // 如果状态已完成，清除执行中的标记
            if (latestStatus.status === 'success' || latestStatus.status === 'failed') {
              setExecutingCaseId(null);
            }
            
            return newExecutions;
          });
          
          // 如果当前正在查看该测试用例的日志，则更新日志
          if (currentExecution && currentExecution.id === executingCaseId) {
            const logs = await mockApiService.getExecutionLogs(executingCaseId);
            setExecutionLogs(logs);
          }
        } catch (error) {
          console.error('获取执行状态失败:', error);
        }
      }, 1000);
      
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [executingCaseId, currentExecution]);

  // 模拟加载测试用例数据
  const loadTestCases = async () => {
    setLoading(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟测试用例数据
      const mockTestCases: TestCase[] = [
        { id: '1', name: '写入性能测试', description: '测试磁盘写入速度和IO性能', type: '性能测试' },
        { id: '5', name: '高负载压力测试', description: '在高负载下测试磁盘稳定性', type: '压力测试' },
        { id: '6', name: '长时间运行测试', description: '测试长时间连续读写的稳定性', type: '压力测试' }
      ];
      
      setTestCases(mockTestCases);
      
      // 初始化测试用例执行记录
      const executions: TestCaseExecution[] = mockTestCases.map(testCase => ({
        id: testCase.id,
        name: testCase.name,
        description: testCase.description,
        type: testCase.type,
        status: 'waiting',
        progress: 0
      }));
      setTestCaseExecutions(executions);
    } catch (error) {
      console.error('加载测试用例失败:', error);
      message.error('加载测试用例失败');
    } finally {
      setLoading(false);
    }
  };

  // 执行单个测试用例
  const executeTestCase = async (caseId: string) => {
    try {
      // 发送执行请求到后端
      const response = await mockApiService.startExecution(caseId);
      
      if (response.success) {
        // 设置为执行中状态
        setExecutingCaseId(caseId);
        
        // 更新UI状态
        setTestCaseExecutions(prevExecutions => {
          const index = prevExecutions.findIndex(e => e.id === caseId);
          if (index === -1) return prevExecutions;
          
          const newExecutions = [...prevExecutions];
          newExecutions[index] = {
            ...newExecutions[index],
            status: 'running',
            progress: 0,
            startTime: new Date().toLocaleString()
          };
          return newExecutions;
        });
        
        // 启动模拟后端执行过程
        mockApiService.simulateBackendExecution(caseId);
        
        message.success('测试开始执行');
      } else {
        message.error('启动测试失败');
      }
    } catch (error) {
      console.error('执行测试失败:', error);
      message.error('执行测试失败');
    }
  };

  // 执行所有测试用例
  const executeAllTestCases = async () => {
    // 重置所有测试用例状态
    const resetExecutions = testCaseExecutions.map(execution => ({
      ...execution,
      status: 'waiting' as const,
      progress: 0,
      startTime: undefined,
      endTime: undefined,
      result: undefined
    }));
    setTestCaseExecutions(resetExecutions);
    
    // 依次执行每个测试用例
    for (let i = 0; i < testCases.length; i++) {
      const caseId = testCases[i].id;
      
      try {
        // 发送执行请求到后端
        const response = await mockApiService.startExecution(caseId);
        
        if (response.success) {
          // 设置为执行中状态
          setExecutingCaseId(caseId);
          
          // 更新UI状态
          setTestCaseExecutions(prevExecutions => {
            const index = prevExecutions.findIndex(e => e.id === caseId);
            if (index === -1) return prevExecutions;
            
            const newExecutions = [...prevExecutions];
            newExecutions[index] = {
              ...newExecutions[index],
              status: 'running',
              progress: 0,
              startTime: new Date().toLocaleString()
            };
            return newExecutions;
          });
          
          // 等待测试完成
          await new Promise<void>((resolve) => {
            // 创建模拟执行并存储清理函数
            const cleanupFn = mockApiService.simulateBackendExecution(caseId, () => {
              // 确保最后一次从 API 获取最新状态
              setTimeout(async () => {
                try {
                  // 获取最终状态
                  const finalStatus = await mockApiService.getExecutionStatus(caseId);
                  
                  // 更新状态
                  setTestCaseExecutions(prevExecutions => {
                    const index = prevExecutions.findIndex(e => e.id === caseId);
                    if (index === -1) return prevExecutions;
                    
                    const newExecutions = [...prevExecutions];
                    newExecutions[index] = {
                      ...newExecutions[index],
                      ...finalStatus
                    };
                    return newExecutions;
                  });

                  // 获取和更新日志
                  const logs = await mockApiService.getExecutionLogs(caseId);
                  
                  // 解析日志中最后的测试结果
                  if (logs.includes('[SUCCESS]')) {
                    setTestCaseExecutions(prevExecutions => {
                      const index = prevExecutions.findIndex(e => e.id === caseId);
                      if (index === -1) return prevExecutions;
                      
                      const newExecutions = [...prevExecutions];
                      newExecutions[index] = {
                        ...newExecutions[index],
                        status: 'success',
                        progress: 100,
                        endTime: new Date().toLocaleString(),
                        result: '测试通过，所有指标正常'
                      };
                      return newExecutions;
                    });
                  } else if (logs.includes('[FAILED]')) {
                    setTestCaseExecutions(prevExecutions => {
                      const index = prevExecutions.findIndex(e => e.id === caseId);
                      if (index === -1) return prevExecutions;
                      
                      const newExecutions = [...prevExecutions];
                      newExecutions[index] = {
                        ...newExecutions[index],
                        status: 'failed',
                        progress: 100,
                        endTime: new Date().toLocaleString(),
                        result: '测试失败，性能指标未达标'
                      };
                      return newExecutions;
                    });
                  }
                  
                  // 完成后调用 resolve
                  resolve();
                } catch (error) {
                  console.error('获取执行状态失败:', error);
                  resolve(); // 出错也要继续
                }
              }, 500); // 等待500ms确保状态更新完成
            });
            
            // 返回清理函数
            return cleanupFn;
          });
        }
      } catch (error) {
        console.error(`执行测试用例 ${caseId} 失败:`, error);
        continue; // 继续执行下一个测试用例
      }
    }
    
    // 确保所有更新都已完成后再显示成功消息
    setTimeout(() => {
      // 验证所有测试用例是否都已完成
      const allCompleted = testCaseExecutions.every(
        execution => execution.status === 'success' || execution.status === 'failed'
      );
      
      if (allCompleted) {
        message.success('所有测试执行完成');
      } else {
        message.warning('部分测试可能尚未完成，请检查测试状态');
      }
      
      setExecutingCaseId(null);
    }, 1000); // 等待1秒确保所有状态更新完成
  };
  
  // 查看执行日志
  const showExecutionLog = async (record: TestCaseExecution) => {
    setCurrentExecution(record);
    setLogModalVisible(true);
    setLoadingLogs(true);
    
    try {
      // 从后端获取执行日志
      const logs = await mockApiService.getExecutionLogs(record.id);
      setExecutionLogs(logs);
    } catch (error) {
      console.error('获取执行日志失败:', error);
      setExecutionLogs('[ERROR] 获取执行日志失败');
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center" style={{ padding: '0 4px' }}>
        <div>
          <Title level={4} style={{ marginBottom: 0 }}>
            工具详情: {tool.name}
          </Title>
          <Text type="secondary">
            {tool.description}
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => onExecute(Number(tool.id))}
            style={{ borderRadius: '4px' }}
          >
            执行测试
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(tool)}
            style={{ borderRadius: '4px' }}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(tool)}
            style={{ borderRadius: '4px' }}
          >
            删除
          </Button>
        </Space>
      </div>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="基本信息" key="4">
          <Card style={{ borderRadius: '8px' }}>
            <Descriptions bordered column={1} size="small" labelStyle={{ width: '120px' }}>
              <Descriptions.Item label={<><InfoCircleOutlined /> 名称</>}>{tool.name}</Descriptions.Item>
              <Descriptions.Item label={<><InfoCircleOutlined /> 描述</>}>{tool.description || '-'}</Descriptions.Item>
              <Descriptions.Item label={<><DesktopOutlined /> IP 地址</>}>{tool.ip || '未知'}</Descriptions.Item>
              <Descriptions.Item label={<><TagOutlined /> 分类</>}>
                <Tag color="blue">{getCategoryText(tool.category)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<><TagOutlined /> 版本</>}>{tool.version || '-'}</Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined /> 作者</>}>{tool.author || '系统'}</Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> 创建时间</>}>{tool.createdAt ? new Date(tool.createdAt).toLocaleString() : '-'}</Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> 更新时间</>}>{tool.updatedAt ? new Date(tool.updatedAt).toLocaleString() : '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </TabPane>
        <TabPane tab="测试用例" key="1">
          <Card style={{ borderRadius: '8px' }}>
            <Spin spinning={loading}>
              {testCases.length > 0 ? (
                <>
                  <div className="mb-4 flex justify-between">
                    <Text strong>测试用例执行</Text>
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />} 
                      onClick={executeAllTestCases}
                      disabled={executingCaseId !== null}
                    >
                      执行所有测试
                    </Button>
                  </div>
                  <TestCaseTable 
                    testCaseExecutions={testCaseExecutions}
                    loading={loading}
                    executingCaseId={executingCaseId}
                    onExecuteTestCase={executeTestCase}
                    onViewLogs={showExecutionLog}
                  />
                </>
              ) : (
                <Empty description="暂无测试用例" />
              )}
            </Spin>
          </Card>
        </TabPane>
        <TabPane tab={<span><FileTextOutlined /> 执行历史</span>} key="2">
          <Card style={{ borderRadius: '8px' }}>
            {children}
          </Card>
        </TabPane>
        <TabPane tab={<span><BarChartOutlined /> 性能测试</span>} key="3">
          <PerformanceTestPage toolId={tool.id} />
        </TabPane>
      </Tabs>
      
      {/* 执行日志弹窗 */}
      <Modal
        title={`${currentExecution?.name || ''} 执行日志`}
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={[
          <Button key="download" icon={<FileTextOutlined />} onClick={() => {
            // 创建Blob对象
            const blob = new Blob([executionLogs], { type: 'text/plain;charset=utf-8' });
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            // 创建a标签并设置属性
            const link = document.createElement('a');
            link.href = url;
            // 设置文件名（包含测试用例名称和时间戳）
            const fileName = `${currentExecution?.name || '执行日志'}_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
            link.download = fileName;
            // 触发点击事件
            document.body.appendChild(link);
            link.click();
            // 清理
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success('日志下载成功');
          }}>
            下载日志
          </Button>,
          <Button key="close" onClick={() => setLogModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        <Spin spinning={loadingLogs}>
          <div
            style={{
              maxHeight: '400px',
              overflow: 'auto',
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}
          >
            {executionLogs}
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default ToolDetails;