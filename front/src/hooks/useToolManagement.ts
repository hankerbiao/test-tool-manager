import { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { TestTool, TestCaseExecution, ExecutionHistory } from '../types';
import { api } from '../services/api';

/**
 * 工具管理Hook
 */
export const useToolManagement = () => {
  // 状态定义
  const [testTools, setTestTools] = useState<TestTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<TestTool | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [executions, setExecutions] = useState<TestCaseExecution[]>([]);
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [executionLogVisible, setExecutionLogVisible] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<TestCaseExecution | null>(null);

  // 初始化测试工具数据
  useEffect(() => {
    const loadToolsData = async () => {
      setLoading(true);
      try {
        // 从API加载工具数据
        const tools = await api.getTools();
        setTestTools(tools);
        if (tools.length > 0) {
          setSelectedTool(tools[0]);
        }
        
        // 这部分仍使用模拟的执行历史数据，后续可改为API调用
        const mockHistory: ExecutionHistory[] = [
          { 
            id: '1',
            toolId: '1',
            toolName: '磁盘测试工具',
            startTime: '2023-08-15 09:30:00', 
            endTime: '2023-08-15 10:45:00', 
            status: 'success',
            timestamp: '2023-08-15 09:30:00',
            executor: '管理员',
            progress: 100
          },
          { 
            id: '2',
            toolId: '1',
            toolName: '磁盘测试工具',
            startTime: '2023-08-16 14:20:00', 
            endTime: '2023-08-16 15:15:00', 
            status: 'failed',
            timestamp: '2023-08-16 14:20:00',
            executor: '测试员',
            progress: 85
          },
          { 
            id: '3',
            toolId: '3',
            toolName: '网络延迟测试',
            startTime: '2023-08-17 11:10:00', 
            endTime: '2023-08-17 12:05:00', 
            status: 'success',
            timestamp: '2023-08-17 11:10:00',
            executor: '开发人员',
            progress: 100
          }
        ];
        
        setExecutionHistory(mockHistory);
      } catch (error) {
        console.error('加载数据失败', error);
        message.error('加载工具数据失败');
      } finally {
        setLoading(false);
      }
    };
    
    loadToolsData();
  }, []);

  // 按工具名和描述搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  // 按分类筛选
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  // 选择工具
  const handleSelectTool = (tool: TestTool) => {
    setSelectedTool(tool);
  };

  // 添加新工具
  const handleAddTool = () => {
    // 不再显示消息，由外部控制打开模态框
    // 这里可以添加其他准备工作逻辑
  };

  // 编辑工具
  const handleEditTool = (tool: TestTool) => {
    message.info(`编辑工具: ${tool.name}`);
  };

  // 删除工具
  const handleDeleteTool = async (tool: TestTool) => {
    if (!tool.id) {
      message.error('工具ID不能为空');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工具"${tool.name}"吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 显示加载状态
          message.loading({ content: '正在删除...', key: 'deleteTool' });
          
          // 调用API删除工具
          const success = await api.deleteTool(tool.id);
          
          if (success) {
            // 从本地状态中移除被删除的工具
            setTestTools(prevTools => prevTools.filter(t => t.id !== tool.id));
            
            // 如果当前选中的工具是被删除的工具，重置选中状态
            if (selectedTool && selectedTool.id === tool.id) {
              setSelectedTool(null);
            }
            
            message.success({ content: `工具"${tool.name}"已成功删除`, key: 'deleteTool' });
          } else {
            message.error({ content: `删除工具"${tool.name}"失败`, key: 'deleteTool' });
          }
        } catch (error) {
          console.error('删除工具时出错:', error);
          message.error({ content: `删除工具"${tool.name}"失败: ${error}`, key: 'deleteTool' });
        }
      }
    });
  };

  // 执行工具
  const handleExecuteTool = (toolId: number) => {
    message.info(`执行工具: ${selectedTool?.name}`);
  };

  // 查看执行日志
  const handleViewExecutionLog = (execution: TestCaseExecution) => {
    setSelectedExecution(execution);
    setExecutionLogVisible(true);
  };

  // 查看用例详情
  const handleViewCaseDetail = (caseId: string) => {
    message.info(`查看用例 #${caseId} 详情`);
  };

  // 过滤工具列表
  const filteredTools = testTools.filter(tool => {
    // 按分类筛选
    if (categoryFilter !== 'all' && tool.category !== categoryFilter) {
      return false;
    }
    
    // 按名称或描述搜索
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      return (
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // 添加新工具到列表
  const addTool = (tool: TestTool) => {
    setTestTools(prevTools => [tool, ...prevTools]);
    setSelectedTool(tool);
  };

  // 更新已有工具
  const updateTool = (tool: TestTool) => {
    setTestTools(prevTools => 
      prevTools.map(t => t.id === tool.id ? tool : t)
    );
    setSelectedTool(tool);
  };

  return {
    testTools,
    selectedTool,
    loading,
    searchValue,
    categoryFilter,
    executions,
    executionHistory,
    executionLoading,
    executionLogVisible,
    selectedExecution,
    filteredTools,
    setExecutionLogVisible,
    handleSearch,
    handleCategoryChange,
    handleSelectTool,
    handleAddTool,
    handleEditTool,
    handleDeleteTool,
    handleExecuteTool,
    handleViewExecutionLog,
    handleViewCaseDetail,
    addTool,
    updateTool
  };
}; 