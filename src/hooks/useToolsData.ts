import { useState, useEffect, useCallback } from 'react';
import { TestTool } from '../types/tools';
import { fetchTools, createTool, updateTool, deleteTool } from '../api/toolsApi';
import { message } from 'antd';

/**
 * 自定义Hook，用于管理工具数据
 */
export const useToolsData = () => {
  const [tools, setTools] = useState<TestTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载工具数据
  const loadTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTools();
      setTools(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载工具数据失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadTools();
  }, [loadTools]);

  // 添加新工具
  const addTool = useCallback(async (tool: Omit<TestTool, 'id'>) => {
    try {
      const newTool = await createTool(tool);
      setTools(prevTools => [...prevTools, newTool]);
      message.success('工具添加成功');
      return newTool;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加工具失败';
      message.error(errorMessage);
      throw err;
    }
  }, []);

  // 更新工具
  const updateToolData = useCallback(async (id: string, updates: Partial<TestTool>) => {
    try {
      const updatedTool = await updateTool(id, updates);
      setTools(prevTools => 
        prevTools.map(tool => tool.id === id ? { ...tool, ...updates } : tool)
      );
      message.success('工具更新成功');
      return updatedTool;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新工具失败';
      message.error(errorMessage);
      throw err;
    }
  }, []);

  // 删除工具
  const removeTool = useCallback(async (id: string) => {
    try {
      await deleteTool(id);
      setTools(prevTools => prevTools.filter(tool => tool.id !== id));
      message.success('工具删除成功');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除工具失败';
      message.error(errorMessage);
      throw err;
    }
  }, []);

  return {
    tools,
    loading,
    error,
    loadTools,
    addTool,
    updateTool: updateToolData,
    removeTool,
  };
}; 